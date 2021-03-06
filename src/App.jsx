import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import waveportal from "./utils/WavePortal.json";
 
const App = () => {

  //Just a state variable we use to store our user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xA13C674F8A8715E157BA42237A6b1Dff24EE274F";

  // Create a method to get all waves from your contract
  const getAllWaves = async () => {
    const { ethereum } = window;
    
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

        // Call all the getAllWaves method from your smart contract
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // Store our data in React State
        setAllWaves(wavesCleaned);

        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  //Listen in for emitter events!
  
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      //checks if Ethereum wallet is connected
      if (!ethereum) {
        console.log("Make sure you have Metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      //Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts"});
    
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }    
    } catch (error) {
      console.log(error);
    }
  }

  //Implement your connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);     setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer)

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        //Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined--", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }  

  // This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();  
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          ???? Hii there!
        </div>

        <div className="bio">
          I am Ronin, building smart contracts, one block at a time.
        </div>

        <div className="tagline">Wave at me, make I dash you some eth :)
        </div>

        <button className="waveButton" onclick={wave}>
          WAVE AT ME
        </button> 
        
        {/*If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}> Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App