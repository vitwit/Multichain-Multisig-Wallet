import React from 'react'
import { Button } from 'antd';
import { message } from 'antd';
import {Layout,Card,Row,Col,Icon} from 'antd'
import styled from 'styled-components'
import { Tabs } from 'antd';
import axios from 'axios'
import {apiUrl} from '../constants/constants'
import { Avatar } from 'antd';
import {Popover} from 'antd'
import Clipboard from 'react-clipboard.js';

const { Header,Footer,Content,Sider} = Layout

const TabPane = Tabs.TabPane;




const H1 = styled.h1`
    color:white;
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

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            walletInfo:null,
            multiWalletInfo:null,
            toAddress:null,
            privkey:null,
            amount:0,
            signHex:null
        }
        this.logOut = this.logOut.bind(this)
        this.handleSendSubmit = this.handleSendSubmit.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleMultiSendSubmit =this.handleMultiSendSubmit.bind(this)
        this.updateWalletInfo = this.updateWalletInfo.bind(this)
        this.handleSignSubmit = this.handleSignSubmit.bind(this)
    }

    componentDidMount() {

        if(localStorage.getItem('account')) {
            message.success('Welcome '+localStorage.getItem('account'),4)
            this.updateWalletInfo()
        }
        else {
            this.props.history.push('/createwallet')
        }
    }

    updateWalletInfo () {
        axios({
            method: 'post',
            url: apiUrl+'/profile',
            data: {
              address:localStorage.getItem('account'),
              chain:localStorage.getItem('chain')
            }
          }).then((resp)=>{
              if(resp.data.data.length>0) {
                this.setState({
                    walletInfo:resp.data.data[0]
                })
              }
              
          })
          
        if(JSON.parse(localStorage.getItem('hasMulti'))) {
            axios({
                method: 'post',
                url: apiUrl+'/profile',
                data: {
                address:localStorage.getItem('multiAddresses'),
                chain:localStorage.getItem('chain')
                }
            }).then((resp)=>{
                if(resp.data.data.length>0) {
                    this.setState({
                        multiWalletInfo:resp.data.data[0]
                    })
                }
                
            })
        }
    }

    handleInputChange (event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleSendSubmit (event) {
        event.preventDefault()
        axios({
            method: 'post',
            url: apiUrl+'/sendasset',
            data: {
                fromAddess:localStorage.getItem('account'),
                toAddress:this.state.toAddress,
                amount:JSON.parse(this.state.amount),
                chain:localStorage.getItem('chain'),
                privKey:this.state.privkey
            }
          }).then((resp)=>{
              console.log(resp.data.success)
              if(resp.data&&resp.data.success) {
                message.success(resp.data.message,3)
                this.updateWalletInfo()
              }
              else {
                message.error(resp.data.message,3)
              }
          })
    }

    handleMultiSendSubmit(event) {
        event.preventDefault()
        
        axios({
            method: 'post',
            url: apiUrl+'/sendmultisigasset',
            data: {
                fromAddress:localStorage.getItem('multiAddresses'),
                refferAddress:localStorage.getItem('account'),
                toAddress:this.state.toAddress,
                amount:JSON.parse(this.state.amount),
                node:localStorage.getItem('chain'),
                privKey:this.state.privkey
            }
          }).then((resp)=>{
              console.log(resp)
              if(resp.data.success) {
                    
                    message.success(
                        <div>
                                <p>Copy Hex and Sign With Another User</p>
                                <Clipboard data-clipboard-text={resp.data.data.hex}>
                                    <Icon type="copy" style={{color:"black"}} theme="filled" />
                                </Clipboard>
                        </div>
                    ,20)
                    this.updateWalletInfo()
              }
              else {
                message.error(resp.data.message,3)
              }
          })

    }

    handleSignSubmit (event) {
        event.preventDefault()
        axios({
            method: 'post',
            url: apiUrl+'/signtransaction',
            data: {
                address:localStorage.getItem('multiAddresses'),
                hex:this.state.signHex,
                node:localStorage.getItem('chain'),
                privKey:this.state.privkey
            }
          }).then((resp)=>{
            if(resp.data.success) {
                message.success(resp.data.message,3)
                this.updateWalletInfo()
            }
            else {
                message.error(resp.data.message,3)
            }
              
          })
    }

    logOut() {
        console.log('logout')
        localStorage.removeItem('account')
        localStorage.removeItem('hasMulti')
        localStorage.removeItem('multiAddresses')
        localStorage.removeItem('chain')
        this.props.history.push('/createwallet')
    }

    render() {
        return (
            <div>
                <Layout>
                    <Header>
                        <Row>

                            <Col span={5}>
                                <H1 color="white">Multichain-TEST</H1>
                            </Col>

                            <Col span={1} offset={18}>
                            <Popover 
                                placement="bottomRight"
                                content = {
                                    <Button onClick={this.logOut}><Icon type="logout" /></Button>
                                }
                                trigger="click">
                                <Avatar shape="square" size="large" icon="user" />
                            </Popover>
                            </Col>

                        </Row>
                    </Header>

                    <Content style={{ padding: '0 50px' }}>
    
                        <Tabs defaultActiveKey="1" >

                            <TabPane tab={<span><Icon type="wallet" />Wallet</span>} key="1">
                                <Row>
                                    <Col span={10} offset={6}>
                                        <h1>Address: {localStorage.getItem('account')}</h1>
                                        <h1>Tokens : {this.state.walletInfo?this.state.walletInfo.qty:0}</h1>
                                    </Col>
                                </Row>
                            </TabPane>

                            <TabPane tab={<span><Icon type="up" />Send</span>} key="2">
                                <Row>
                                    <Col span={20} offset={2}>
                                        <form onSubmit={event => this.handleSendSubmit(event)}>
                                            <h1>To</h1><Input1 name="toAddress" type="text" required placeholder="Enter wallet address" onChange={ event => this.handleInputChange(event)}/>
                                            <br/>
                                            <h1>Private Key</h1><Input1 name="privkey" type="text" required placeholder="Enter private key of yours" onChange={ event => this.handleInputChange(event)}/>
                                            <br/>
                                            <h1>Amount</h1><Input1 name="amount" required type="number" placeholder="Enter amount you want to send" onChange={ event => this.handleInputChange(event)}/>
                                            <br/>
                                            <Submit>Send</Submit>
                                       </form>
                                    </Col>
                                </Row>
                                
                            </TabPane>
                    
                            {JSON.parse(localStorage.getItem('hasMulti'))?<TabPane tab={<span><Icon type="usergroup-add" />MultiSigwallet</span>} key="3">
                            
                            <Tabs defaultActiveKey="1" >

                                <TabPane tab={<span><Icon type="wallet" />Wallet</span>} key="1">
                                    <Row>
                                        <Col span={10} offset={6}>
                                            <h1>Address: {localStorage.getItem('multiAddresses')}</h1>
                                            <h1>Tokens : {this.state.multiWalletInfo?this.state.multiWalletInfo.qty:0}</h1>
                                        </Col>
                                    </Row>
                                </TabPane>

                                <TabPane tab={<span><Icon type="up" />Send</span>} key="2">
                                <Row>
                                    <Col span={20} offset={2}>
                                        <form onSubmit={event => this.handleMultiSendSubmit(event)}>
                                            <h1>To</h1><Input1 name="toAddress" type="text" required placeholder="Enter wallet address" onChange={ event => this.handleInputChange(event)}/>
                                            <br/>
                                            <h1>Private Key</h1><Input1 name="privkey" type="text" required placeholder="Enter private key of yours" onChange={ event => this.handleInputChange(event)}/>
                                            <br/>
                                            <h1>Amount</h1><Input1 name="amount" required type="number" placeholder="Enter amount you want to send" onChange={ event => this.handleInputChange(event)}/>
                                            <br/>
                                            <Submit>Send</Submit>
                                       </form>
                                    </Col>
                                </Row>
                                </TabPane>

                                <TabPane tab={<span><Icon type="check" />Sign Tx</span>}  key="3">
                                    <Row>
                                        <Col span={20} offset={2}>

                                        </Col>

                                    </Row>
                                        <Col span={20} offset={2}>
                                            <form onSubmit={event => this.handleSignSubmit(event)}>
                                                <h1>Private Key</h1><Input1 name="privkey" type="text" required placeholder="Enter private key of yours" onChange={ event => this.handleInputChange(event)}/>
                                                <br/>
                                                <h1>Hex</h1><Input1 name="signHex" type="text" required placeholder="Enter Hex Address" onChange={ event => this.handleInputChange(event)}/>
                                                <br/>
                                                <Submit>Sign</Submit>
                                        </form>
                                       </Col>
                                </TabPane>
                            </Tabs>
                            </TabPane>:null}        
                        </Tabs>
                    </Content>

                </Layout>
            </div>
        )
    }
}

export default Home