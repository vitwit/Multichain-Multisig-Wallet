import React,{ Suspense,lazy } from 'react';
import {Layout,Row,Col,Icon} from 'antd'
import styled from 'styled-components'
import {apiUrl} from '../constants/constants'
import axios from 'axios'
// import { Progress } from 'antd';
import { Modal, Card } from 'antd';
import { message, Button } from 'antd';
import { Divider } from 'antd';
import ReactToPrint from "react-to-print";
import { Route, Redirect } from 'react-router'


const Header2 = styled.h1`
    color:white;
    
`
const Button1 = styled.button`
    width:100%;
    background: #22283a;
    font-weight: bold;
    color: white;
    border: 0 none;
    border-radius: 25px;
    cursor: pointer;
    padding: 10px 5px;
    margin: 10px 5px;
    font-family: Lato, sans-serif;
`

const Input1 = styled.input`

    position: relative;
    display: block;
    width: 100%;
    margin-top: 20px;
    padding: 15px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    color: #a0a0a0;
    outline: none;
`

const Submit = styled.button`
    margin-top: 10px;
    font-size: 1.0rem;
    padding: 0.5rem 4rem;
    display: block;
    background-color: #009ac9;
    border: 1px solid transparent;
    color: #ffffff;
    font-weight: 200;
    -webkit-border-radius: 3px;
    border-radius: 3px;
    -webkit-transition: all 0.3s ease-in-out;
    -moz-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
`

const Section = styled.div`
    padding: 15% 0
`
const { Header,Footer,Content,Sider} = Layout


class CreateWallet extends  React.Component {
    constructor(props) {
        super(props)
        this.state = {
            address:null,
            walletdata:null,
            firstwallet:null,
            secondwallet:null,
            multiaccount:null,
            createWalletModal:false,
            multiSigWalletModal:false

        }
        this.handleCreatewallet = this.handleCreatewallet.bind(this)
        this.handleMultisigWallet = this.handleMultisigWallet.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleFaucetSubmit = this.handleFaucetSubmit.bind(this)
    }


    setcreateWalletModalVisible(createWalletModal) {
        this.setState({
            createWalletModal
        })
    }

    setmultiSigWalletModallVisible(multiSigWalletModal) {
        this.setState({
            multiSigWalletModal
        })
    }

    handleInputChange (event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleSubmit (event) {
        event.preventDefault()
        console.log(this.state.address)
        axios({
            method: 'post',
            url: apiUrl+'/signin',
            data: {
              address:this.state.address
            }
          }).then((resp) => {
                console.log(resp)
                if(resp.data.isvalid) {
                    localStorage.setItem('account',this.state.address)
                    localStorage.setItem('hasMulti',resp.data.hasMulti)
                    localStorage.setItem('multiAddresses',resp.data.multiAddresses)
                    localStorage.setItem('chain',resp.data.belongsTo)
                    this.props.history.push('/info')

                }
                else {
                    message.error('Invalid Account address', 3)
                }
          })
    }


    handleCreatewallet () {
        console.log('clicked')
        axios.get(apiUrl+'/createaccount').then((resp) => {
            console.log(resp.data.walletData)
            message.success('Wallet Created Successfully', 3)
            this.setState({
                walletdata:resp.data.walletData,
                createWalletModal:true
            })
        })

        
    }

    handleMultisigWallet () {
        
        axios.get(apiUrl+'/createmultisigaccount').then((resp) => {
            console.log(resp.data)
            message.success('Wallet Created Successfully', 3)
            this.setState({
                multiaccount:resp.data.multiaccount,
                firstwallet:resp.data.firstwallet,
                secondwallet:resp.data.secondwallet,
                multiSigWalletModal:true
            })
        })
    }

    handleFaucetSubmit (event) {
        event.preventDefault()
        axios({
            method: 'post',
            url: apiUrl+'/faucet',
            data: {
                toAddress:this.state.address
            }
          }).then((resp) => {
                console.log(resp)
                if(resp.data.success) {
                    this.setState({
                        address:null
                    })
                    message.success('Got 100 Tokens',5)
                }
                else {
                    message.error(resp.data.err.message, 5)
                }
          })
    }



    render() {
        return (
            <div>
                <Layout>
                <Header>
                    <Header2>Sentitel-Multichain</Header2> 
                </Header>

                    <Content style={{ padding: '0 50px' }}>

                        <Modal
                            ref={el => (this.componentRef1 = el)}
                            title="Wallet Created Successfully"
                            style={{ top: 20 }}
                            visible={this.state.createWalletModal}
                            onOk={() => this.setcreateWalletModalVisible(false)}
                            >
                            <Divider>Address</Divider>
                            <p>{this.state.walletdata&&this.state.walletdata.address}</p>
                            <Divider>Public Key</Divider>
                            <p>{this.state.walletdata&&this.state.walletdata.pubkey}</p>
                            <Divider>Private Key</Divider>
                            <p>{this.state.walletdata&&this.state.walletdata.privkey}</p>
                            <ReactToPrint
                                trigger={() => <a href="#"><Icon type="printer" theme="filled" /></a>}
                                content={() => this.componentRef1}
                            />
                        </Modal>
                        
                        
                        
                        <Modal
                            ref={el => (this.componentRef = el)}
                            title="Wallet Created Successfully"
                            style={{ top:10 }}
                            visible={this.state.multiSigWalletModal}
                            onOk={() => this.setmultiSigWalletModallVisible(false)}
                            >

                            <Divider>MultiAccount</Divider>
                                <p>{this.state.multiaccount}</p>
                            <Divider dashed />

                            <Divider>Address</Divider>
                            <p>{this.state.firstwallet&&this.state.firstwallet.address}</p>
                            <Divider>Public Key</Divider>
                            <p>{this.state.firstwallet&&this.state.firstwallet.pubkey}</p>
                            <Divider>Private Key</Divider>
                            <p>{this.state.firstwallet&&this.state.firstwallet.privkey}</p>
                            
                            <Divider dashed />

                            <Divider>Address</Divider>
                            <p>{this.state.secondwallet&&this.state.secondwallet.address}</p>
                            <Divider>Public Key</Divider>
                            <p>{this.state.secondwallet&&this.state.secondwallet.pubkey}</p>
                            <Divider>Private Key</Divider>
                            <p>{this.state.secondwallet&&this.state.secondwallet.privkey}</p>


                            <ReactToPrint
                                trigger={() => <a href="#"><Icon type="printer" theme="filled" /></a>}
                                content={() => this.componentRef}
                            />
                        </Modal>
                        



                        <Section>
                       <Row>
                           <Col span={4} offset={8}>
                                <Button1 onClick={this.handleCreatewallet}>Create Wallet</Button1>
                           </Col>
                           <Col span={4} offset={1}>
                                <Button1 onClick={this.handleMultisigWallet}>Create MultiSig Wallet</Button1>
                           </Col>
                           
                       </Row>
                       <form onSubmit={event => this.handleSubmit(event)}>
                       <Row>
                           
                           <Col span={6} offset={9}>
                                <Input1 name="address" required placeholder="Enter Address" onChange={ event => this.handleInputChange(event)}/>
                           </Col>
                           
                       </Row>

                       <Row>
                           <Col span={4} offset={10}>
                                <Submit>Login</Submit>
                           </Col>
                           
                       </Row>
                       </form>

                       <form onSubmit={event => this.handleFaucetSubmit(event)}>
                       <Row>
                           
                           <Col span={6} offset={9}>
                                <Input1 name="address" required placeholder="Enter Address" onChange={ event => this.handleInputChange(event)}/>
                           </Col>
                           
                       </Row>

                       <Row>
                           <Col span={4} offset={10}>
                                <Submit>Get Free Tokens</Submit>
                           </Col>
                           
                       </Row>
                       </form>

                       </Section>
                    </Content>
                    
                    <Footer>Footer</Footer>
                </Layout>
            </div>
        )
    }

}

export default CreateWallet