import React, {useEffect, useState, useRef} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const messageRef = useRef();
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xB803e6866990966D3FefF4dF063f5205b2E409f0";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object does not exist!");
      }
    }
    catch (error) {
      console.log(error);
    }
  }
   const checkIfWalletIsConnected = async () => {

     try {
       const { ethereum } = window;

       if(!ethereum){
         console.log("Please make sure you have Metamask installed!");
         return;
       }
       else{
         console.log("WAGMI legend!", ethereum);
         getAllWaves();
       }

       const accounts = await ethereum.request({method: "eth_accounts"});

       if(accounts.length !== 0){
         const account = accounts[0];
         console.log("Found an authroized account : ", account);
         setCurrentAccount(account);
         getAllWaves();
       }
       else {
         console.log("No authorized account found!");
       }
      }
      catch (error) {
        console.log(error);
      }
   }

   const connectWallet = async () => {
     try {
       const { ethereum } = window;

       if(!ethereum){
         console.log("Get Metamask !");
         alert("Use this in Brave or MetaMask")
       }

       const accounts = await ethereum.request({method: "eth_requestAccounts"});

       console.log("Connected", accounts[0]);
       setCurrentAccount(accounts[0]);
     }
     catch (error) {
       console.log(error);
     }
   }

  const wave =  async () => {
    try {
      const { ethereum } = window;

      if(ethereum){
        const provider =  new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(messageRef.current.value, {gasLimit : 300000});
        console.log("Mining.....", waveTxn.hash);
        alert("Mining", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);
        alert("Mined --", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave acount...", count.toNumber());
        alert("Retrieved total wave acount...", count.toNumber());
      }
      else{
        console.log("Ethereum object does not exist");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    //checkIfWalletIsConnected();

    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("newWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("newWave", onNewWave);
    }  

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        My name is 0xAstro and I love to build products that create an impact on the lives of others.
        </div>
        <input className="waveIput" ref={messageRef} style={{height: "90px"}}></input>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (<button className="waveButton" onClick={connectWallet}>Connect Wallet</button>)}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="allWaves" style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address : {wave.address}</div>
              <div>Time : {wave.timestamp.toString()}</div>
              <div>Message : {wave.message}</div>
            </div>
          );
          })
        }
      </div>
    </div>
  );
}
