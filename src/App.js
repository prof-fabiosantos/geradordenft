import { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { NFTStorage } from 'nft.storage';
import Web3 from 'web3';
import nft from './NFT.json';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ipfs, setIpfs] = useState('');
  const [img, setImg] = useState("");
  const [address, setAddress] = useState('Connect Wallet');  

  const configuration = new Configuration({
    apiKey: 'coloque sua chave aqui',
  });

  const openai = new OpenAIApi(configuration);

  const generateImage = async () => {
    setLoading(true);
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: '512x512',
    });
    setLoading(false);
    setResult(response.data.data[0].url);    
    
  };
  
  const StoreMetadata = async (image, Name, Description) => {
    console.log('Preparing Metadata ....');
    const nft = {
      image: image,
      name: Name,
      description: Description,
    };
    console.log('Uploading Metadata to IPFS ....');
    const client = new NFTStorage({
      token: 'coloque sua chave aqui',
    });
    const metadata = await client.store(nft);
    console.log(metadata);
    console.log('NFT data stored successfully 🚀🚀');
    console.log('Metadata URI: ', metadata.url);

    return metadata;
  };

  async function connectwallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        setAddress(address.slice(0, 6));
        console.log(await web3.eth.getBlockNumber());
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('Install Metamask');
    }
  }

  const upload = async () => {
    try {
      const metadata = await StoreMetadata(img, name, description);
      const uri = metadata.url;
      setIpfs(uri);
     
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      const contract = new web3.eth.Contract(nft.abi, nft.address);
      let trx = await contract.methods.mint(address, uri).send({ from: address });         
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
  <div className="app">
      <button className="button" onClick={connectwallet}>
      {address}
      </button>
      <h1>Generador de NFT baseado em IA</h1>
      {loading ? (
          <h2>Generação de imagem em progresso... Por favor, aguarde!</h2>
          ) : (
          <></>
      )}
    <div className="card">
      <textarea
        className="text-input"
        placeholder="Enter a prompt"
        onChange={(e) => setPrompt(e.target.value)}
        rows="5"
        cols="50"
      ></textarea>
      <p></p>
      <button className="button" onClick={generateImage}>
        Gerar Imagem
      </button>
      {result.length > 0 ? (
        <img className="result-image" src={result} alt="Generated Image" />
      ) : (
        <></>
      )}
      
    <p></p>
    <div>
      <input
        className="text-input"
        type="text"
        value={name}
        placeholder="Nome do NFT"
        onChange={(e) => setName(e.target.value)}
      ></input>
    </div>

    <div>
      <input
        className="text-input"
        type="text"
        value={description}
        placeholder="Descrição para o NFT"
        onChange={(e) => setDescription(e.target.value)}
      ></input>
    </div>
    <p></p>
          <label>
            <input
              className="text-input"
              type="file"
              onChange={(e) => setImg(e.target.files[0])}
            ></input>
          </label>
    <div>
      <button onClick={upload} className="button">
        Mint
      </button>
    </div>
  </div>

  <p className="footer">Copyright Prof. Fabio Santos</p>
</div>
);
}    
export default App;