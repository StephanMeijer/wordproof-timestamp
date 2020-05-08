import React, {Component} from 'react';
import axios from 'axios';
import qs from 'qs';
import Button from "./Button";
import Manual from "./Widget/Manual";
import Automatic from "./Widget/Automatic";

export default class Timestamp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            postId: (props.postId) ? props.postId : null,
            post: (props.post) ? props.post : null,
            meta: (props.meta) ? props.meta : null,
            loading: (props.loading) ? props.loading : null,
            view: (props.view) ? props.view : 'widget',
            interact: (props.interact) ? props.interact : true,
            automatic: (props.automatic) ? props.automatic : true,
            status: null,
            message: '',
        };
    }

    componentDidMount() {

        if (this.state.postId === null) {
            if (this.state.post && this.state.post.id) {
                this.setState({postId: this.state.post.id}, () => {
                    this.refreshPostData();
                });
            } else if ("wordproofPost" in window) {
                this.setState({postId: wordproofPost.postId}, () => {
                    this.refreshPostData();
                });
            }
        }

        if (this.state.post === null || this.state.meta === null) {
            this.refreshPostData();
        } else {
            this.setState({status: this.getStatus()});
        }

        if (this.state.loading === true) {
            this.startLoop();
        }

        console.log(this.state);

    }

    async refreshPostData() {
        if (!this.state.postId)
            return;

        const result = await axios.post(wordproofData.urls.ajax, qs.stringify({
            'action': 'wordproof_get_post_data',
            'post_id': this.state.postId,
            'security': wordproofData.ajaxSecurity
        }));

        this.setState({
                post: result.data.post,
                meta: result.data.meta,
                message: '',
            }, () => this.setState({status: this.getStatus()}, ()=>console.log(this.state.status))
        );
    }

    /**
     * Get Post Status
     * @returns {string}
     */
    getStatus() {
        console.log('getStatus');
        // if (this.state.loading)
        //     return 'connecting';

        if (this.state.post.status !== 'publish' && this.state.post.status !== 'inherit')
            return 'not_published';

        if (!this.state.meta.date)
            return 'not_timestamped';

        if (this.state.meta.date !== this.state.post.date_modified)
            return 'outdated';

        if (!this.state.meta.blockchain)
            return 'awaiting_callback';

        return 'timestamped';
    }

    callback = (reply, success) => {
        this.setState({message: reply});

        if (success)
            this.startLoop();
    }

    startLoop() {
        const loopTill = Date.now() + 16000;
        this.setState({loading: true}, () => {

            const interval = setInterval(() => {

                if (!this.state.loading || Date.now() > loopTill || this.state.status === 'timestamped') {
                    this.setState({loading: false});
                    clearInterval(interval);
                }

                this.refreshPostData().then(() => {
                    if (this.state.status === 'timestamped')
                        this.setState({loading: false});
                });

            }, 3000);

        });
    }

    getTextViewContents() {
        switch (this.state.status) {
            case 'not_published':
                return <span>🕓 Not published yet</span>;
            case 'not_timestamped':
                return <div>
                    <span hidden={this.state.message}>🚨 Not timestamped</span>
                    <Button loading={this.state.loading} callback={this.callback} post={this.state.post} action={'timestamp'}/>
                </div>;
            case 'outdated':
                return <div><span hidden={this.state.message}>🚨 Timestamp is outdated</span>
                    <Button loading={this.state.loading} callback={this.callback} post={this.state.post} action={'timestamp'}/>

                </div>;
            case 'awaiting_callback':
                return <div><span hidden={this.state.message}>🕓 Waiting for callback...</span>
                    <Button loading={this.state.loading} callback={this.callback} post={this.state.post} action={'retry'}/>
                </div>;
            case 'timestamped':
                if (this.state.post.type === 'post' || this.state.post.type === 'page' || this.state.post.type === 'product')
                    return <a href={this.state.post.permalink + '#wordproof'}>✅ Certificate</a>;
                return <span>✅ Timestamped</span>;
            default:
                return false;
        }
    }

    renderView() {
        if (this.state.view === 'text') {
            return (
                <div className={'wordproof-timestamp-button-inner'}>
                    {(this.state.loading) ?
                        <img className={`loading-spinner`} src={wordproofData.images.loading} alt={`loading`}/> : ''}
                    { this.getTextViewContents() }
                    {(this.state.loading) ? this.state.message : ''}
                </div>
            )
        } else if (this.state.view === 'widget') {
            if (!this.state.automatic)
                return <Manual/>

            return <Automatic status={this.state.status} post={this.state.post} loading={this.state.loading}/>;
        }
    }

    render() {
        return (
            this.renderView()
        );
    }
}
