<?php

namespace WordProof;

use WordProof\includes\Ajax;
use WordProof\includes\Page\HelpPage;
use WordProof\includes\MetaBox;
use WordProof\includes\Page\ProofPage;
use WordProof\includes\Page\SettingsPage;
use WordProof\includes\CertificateHelper;

/**
 * Class WordProof
 * @package WordProof
 */
class WordProof {

    /** @var null */
    private static $instance = null;

    public function init() {
        /**
         * Bootstrap
         */
        new ProofPage();
        new SettingsPage();
//        new HelpPage();
        new MetaBox();
        new Ajax();

        /**
         * Actions
         */
	    add_filter('manage_posts_columns', array($this, 'addColumn'));
	    add_action('manage_posts_custom_column', array($this, 'addColumnContent'), 10, 2);
	    add_filter('the_content', array($this, 'addProofLink'), 999, 1);
        add_action('admin_enqueue_scripts', array($this, 'loadAdminAssets'), 999);
    }

	public function addColumn($defaults) {
		$defaults['wordproof'] = 'WordProof';
		return $defaults;
	}

	public function addColumnContent($column_name, $post_id) {
		if ($column_name == 'wordproof') {
			$proof_date = get_post_meta($post_id, 'wordproof_date', true);

			if ($proof_date) {
				if ($proof_date === get_the_modified_date('Y-m-d H:i:s',$post_id)){
					echo '<a target="_blank" href="'.get_permalink($post_id).'?wordproof">Stamped</a>';
				} else {
					echo '<a target="_blank" href="'.get_permalink($post_id).'?wordproof">Outdated</a>';
				}
			} else {
				echo '—';
			}

		}
	}

	public function addProofLink($content) {
    	global $post;

    	if (!empty($post)) {
		    $proof_date = get_post_meta($post->ID, 'wordproof_date', true);

		    if ($proof_date) {
		    	$content .= CertificateHelper::getCertificate(get_permalink($post->ID).'?wordproof');
		    }
	    }

    	return $content;
	}


	public function loadAdminAssets() {
        global $post;
        wp_enqueue_style('wordproof.admin.css', WORDPROOF_URI_CSS . '/admin.css', array(), filemtime(WORDPROOF_DIR_CSS . '/admin.css'));

        wp_enqueue_script('wordproof.admin.js', WORDPROOF_URI_JS . '/admin.js', array(), filemtime(WORDPROOF_DIR_JS . '/admin.js'), true);
        wp_localize_script('wordproof.admin.js', 'wordproofData', array(
            'ajaxURL' => admin_url('admin-ajax.php'),
            'settingsURL' => admin_url('admin.php?page=wordproof'),
            'ajaxSecurity' => wp_create_nonce('wordproof'),
            'postId' => (!empty($post->ID)) ? $post->ID: false,
            'network' => get_option('wordproof_network', 'eos_main'),
            'storeRam' => get_option('wordproof_store_ram', false),
            'storeContent' => get_option('wordproof_store_content', false)
        ));
    }

    /**
     * @return null|WordProof
     */
    public static function getInstance() {
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}