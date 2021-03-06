<?php

namespace WordProofTimestamp\includes;

use WordProofTimestamp\includes\Controller\HashController;
use WordProofTimestamp\includes\Controller\TimestampController;
use WordProofTimestamp\includes\Resources\ItemResource;

class AutomaticHelper {

	protected $options;
	protected $oauth;
	protected $post;
	protected $accessToken;
	protected $body;
	protected $uri;
	protected $endpoint;
	protected $action;

	/**
	 * AutomaticHelper constructor.
	 *
	 * @param  bool  $postId
	 * @param  bool  $skipAccessToken
	 */
	public function __construct( $postId = false, $skipAccessToken = false ) {
		$this->options = OptionsHelper::getWSFY();
		$this->oauth   = OptionsHelper::getOAuth( [] );

		if ( $postId ) {
			$this->post = get_post( $postId );
		}

		$this->uri = WORDPROOF_API_URI;

		if ( ! $skipAccessToken ) {
			$this->accessToken = $this->getAccessToken();
		}
	}

	public function getAccessToken() {
		if ( isset( $this->oauth->access_token ) ) {
			return $this->oauth->access_token;
		} elseif ( isset( $this->options->site_token ) && isset( $this->options->site_id ) ) {
			return $this->options->site_token;
		}

		return false;
	}


	public function createPost() {
		if ( $this->accessToken ) {

			$this->action = 'create_post';

			if ( wp_next_scheduled( WORDPROOF_WSFY_CRON_HOOK, [ $this->post->ID ] ) ) {
				wp_clear_scheduled_hook( WORDPROOF_WSFY_CRON_HOOK, [ $this->post->ID ] );
			}

			if ( $this->post->post_status !== 'publish' && $this->post->post_status !== 'inherit' ) {
				return [ 'errors' => [ 'post_status' => [ 'Post needs to be published' ] ] ];
			}

			$type       = HashController::getType( $this->post );
			$this->body = ItemResource::getArray( $type, $this->post );

			$this->endpoint = str_replace( '$siteId', $this->options->site_id, WORDPROOF_WSFY_ENDPOINT_ITEM );

			return $result = $this->request();
		} else {
			return [ 'errors' => [ 'authentication' => [ 'Please configure your site key' ] ] ];
		}
	}

	public function retryCallback() {
		if ( $this->accessToken ) {

			$this->action = 'retry_callback';

			$endpoint       = str_replace( '$postId', $this->post->ID, WORDPROOF_WSFY_ENDPOINT_RETRY_CALLBACK );
			$this->endpoint = str_replace( '$siteId', $this->options->site_id, $endpoint );

			if ( ! empty( OptionsHelper::getCustomDomain() ) ) {
				$this->body['overwrite_callback'] = site_url( '/' ) . 'wp-admin/admin-post.php';
			}

			$this->body['type'] = HashController::getType( $this->post );

			return self::request();

		} else {
			return [ 'errors' => [ 'authentication' => [ 'Please configure your site key' ] ] ];
		}
	}

	public function getArticles() {
		if ( $this->accessToken ) {

			$this->action = 'get_articles';

			$endpoint       = str_replace( '$postId', $this->post->ID, WORDPROOF_WSFY_ENDPOINT_GET_ARTICLES );
			$this->endpoint = str_replace( '$siteId', $this->options->site_id, $endpoint );

			return self::request( 'GET' );

		} else {
			return [ 'errors' => [ 'authentication' => [ 'Please configure your site key' ] ] ];
		}
	}

	public function getBalance() {
		if ( $this->accessToken ) {

			$this->action   = 'get_balance';
			$this->endpoint = 'sites/' . $this->options->site_id . '/balance';
			$this->body     = false;

			return self::request( 'GET' );

		} else {
			return [ 'errors' => [ 'authentication' => [ 'Please configure your site key' ] ] ];
		}
	}

	public function validateToken() {
		if ( $this->accessToken ) {
			$this->action   = 'validate_token';
			$this->endpoint = str_replace( '$siteId', $this->options->site_id, WORDPROOF_WSFY_ENDPOINT_TOKEN_VALIDATE );
			$this->body     = [
				'token_id' => $this->oauth->token_id,
				'overwrite_callback' => admin_url( 'admin-post.php' )
			];

			return self::request();

		} else {
			return [ 'errors' => [ 'authentication' => [ 'Please configure your site key' ] ] ];
		}
	}

	private function request( $method = 'POST' ) {
		$args = [
			'method'  => $method,
			'timeout' => 10,
			'headers' => [
				'Accept'       => 'application/json',
				'Content-Type' => 'application/json',
			],
		];

		if ( $this->accessToken ) {
			$args['headers']['Authorization'] = 'Bearer ' . $this->accessToken;
		}


		if ( $this->body ) {
			$json = json_encode( $this->body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
			$args = array_merge( $args, [ 'body' => $json ] );
		}

		$response = wp_remote_request( $this->uri . $this->endpoint, $args );
		$code     = wp_remote_retrieve_response_code( $response );

		switch ( $code ) { //todo
			case 200:
			case 201:
			case 203:
				return $this->handleSuccessResponse( $response );
			default:
				return $this->handleFailedResponse( $response );
		}
	}

	private function handleSuccessResponse( $response ) {
		$body = json_decode( $response['body'] );

		switch ( $this->action ) {
			case 'get_balance':
				$balance = ( isset( $body->balance ) ) ? intval( $body->balance ) : 0;
				OptionsHelper::set( 'balance', $balance );

				return OptionsHelper::getBalance();

			case 'create_post':
				$balance = OptionsHelper::getBalance();
				if ( $balance === 1 ) {
					OptionsHelper::set( 'balance', 0 );
				}

				TimestampController::saveTimestamp( $this->post->ID, '', '', true );
				break;
			case 'retry_callback':
			case 'validate_token':
			case 'get_articles':
				return $body;

			case 'validate_token':
				if ( ! $body->success ) {
					DebugLogHelper::warning( 'validate_token not successful' );
				}

				return $body;
			default:
				return false;
		}
	}

	private function handleFailedResponse( $response ) {
		DebugLogHelper::error( $this->getErrorMessage( $response ) );

		switch ( $this->action ) {
			case 'create_post':
			case 'retry_callback':
				return $this->returnError( $response );
			case 'get_articles':
			case 'validate_token':
				return $response;
				break;
			case 'get_balance':
			default:
				return [ 'success' => false, 'message' => 'Something went wrong' ];
		}
	}

	private function returnError( $result ) //todo
	{
		if ( isset( $result ) ) {
			if ( is_wp_error( $result ) ) {
				return [ 'errors' => $result->get_error_message() ];
			} elseif ( is_array( $result ) && isset( $result['body'] ) ) {
				return $result['body'];
			} else {
				return $result;
			}
		}
	}

	private function getErrorMessage( $response ) //todo
	{
		if ( is_wp_error( $response ) ) {
			return $response->get_error_message();
		} elseif ( is_array( $response ) && isset( $response['body'] ) ) {
			return print_r( $response['body'], true );
		} else {
			return print_r( $response, true );
		}
	}
}
