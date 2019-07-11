import React, {Component} from 'react'
import initWallet from '../../../wallet';
import ConnectionWidget from '../../ConnectionWidget/ConnectionWidget';

export default class Timestamp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletAvailable: '',
      isLoading: true,
      boxClasses: 'box',
      wallet: null,
      accountName: null,
      balance: null,
      buttonsDisabled: true,
      widgetStatus: 'connecting',
      timestampStatus: null,
      timestampCertificateLink: null
    }
  }

  componentDidMount() {
    this.getWallet();
  }

  getWallet = async () => {
    if (this.state.wallet === null) {
      const wallet = initWallet();
      try {
        await wallet.connect();
        if (!wallet.authenticated) {
          await wallet.login();
        }

        this.registerWalletConnection();
        this.setBalance(wallet.accountInfo.account_name);

        this.setState({
          wallet: wallet,
          accountName: wallet.accountInfo.account_name,
          widgetStatus: 'success',
          buttonsDisabled: false
        });
      } catch (error) {
        this.setState({
          widgetStatus: 'failed',
        });
        console.log(error);
      }
    }
    return this.state.wallet;
  }

  registerWalletConnection = () => {
    return fetch(wordproofData.ajaxURL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      body:
      'action=wordproof_wallet_connection' +
      '&security='+ wordproofData.ajaxSecurity,
    }).then((response) => {
      return response.json();
    })
    .catch(error => console.error(error));
  }

  setBalance = async (accountName) => {
    let result = await fetch(wordproofData.ajaxURL, {
      method: "POST",
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
      body:
      'action=wordproof_get_balance' +
      '&security=' + wordproofData.ajaxSecurity +
      '&accountName=' + accountName,
    }).then((response) => {
      return response.json();
    })
    .catch(error => console.error(error));

    if (result.success) {
      const word = result.balance.replace('.0000', '');
      this.setState({balance: word});
    }
  }

  render() {
    return (
      <div>
        <div className="vo-card">
          <h3>How to Timestamp?</h3>
          <p>Go to any WordPress post or page to secure your content with blockchain.</p>
          <h3>You need WORD stamps to Timestamp (it&apos;s free!)</h3>
          <p>Both as an anti-SPAM measurement and to make sure every timestamp is valuable, WordProof uses &apos;WORD&apos; stamps. Think of 1 WORD as 1 (digital) postage stamp. For every timestamp you place, you need 1 WORD stamp.</p>
          <p>You can timestamp 5 pieces of content per day without &apos;paying&apos; any WORD stamps. As soon as you timestamp your first content, your blockchain account will automatically reiceive 10 WORD stamps. Use the button below to claim 90 additional WORD stamps.</p>
          <a href="https://stamps.wordproof.io" target="_blank" rel="noopener noreferrer" className="button is-primary">Claim 100 WORD for free</a>
          <h3>Scatter connection check & WORD stamps balance</h3>
          <p>Open and unlock your Scatter wallet to check if the setup was successfull: the widget below should color GREEN. If it does, you are ready to timestamp your content by going to any WordPress page/post. </p>

          <ConnectionWidget status={this.state.widgetStatus} balance={this.state.balance}
                            accountName={this.state.accountName}/>

          <input type="submit" onClick={this.props.nextStep} name="submit" id="submit" className="button is-primary" value='Next step'/>

          <h3>Help! WordProof Timestamp does not connect to my Scatter Wallet.</h3>
          <p>Blockchain is no easy technology and requires accounts, wallets and transactions. This is what makes the technology so safe, but also what makes it challenging to create easy-to-use blockchain applications. If the set-up did not work properly, here are a few steps you can take:</p>
          <ol>
            <li>Make sure the Scatter Wallet application is open on your computer and that you unlocked it (entered your passphrase).</li>
            <li>Run the Setup Wizard again and follow each step very carefully. Make sure to save your keys!</li>
            <li>Join the <a href="https://wordproof.io/telegram" target="_blank" rel="noopener noreferrer">WordProof Telegram</a> to ask fellow WordProof users for help.</li>
          </ol>
        </div>
      </div>
    )
  }
}
