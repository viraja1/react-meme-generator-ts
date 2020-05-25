// Import React, react-dom & dom-to-image-more
import * as React from 'react'
import { render } from 'react-dom'
import domtoimage from 'dom-to-image-more'
import {Navbar} from 'react-bootstrap';

// Import components
import Content from './components/content'
import Form from './components/form'
import Result from './components/result'

// Import styles
import './styles/styles.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// App component
function App() {
  // Create refs
  let contentContainerRef = React.useRef<HTMLElement | null>(null)
  let resultContainerRef = React.useRef<HTMLElement | null>(null)

  // Create useState hooks
  const [images, setImages] = React.useState([])
  const [activeImage, setActiveImage] = React.useState('')
  const [textTop, setTextTop] = React.useState('')
  const [textBottom, setTextBottom] = React.useState('')
  const [isMemeGenerated, setIsMemeGenerated] = React.useState(false)
  const [isLoadingGenerator, setIsLoadingGenerator] = React.useState(false);

  // Fetch images from https://api.imgflip.com/get_memes
  async function fetchImage() {

    // Update activeImage state
    await setActiveImage('https://i.imgflip.com/9ehk.jpg');

    // Get the memes
    const imgData = await fetch('https://api.imgflip.com/get_memes').then(res => res.json()).catch(err => console.error(err))
    const { memes } = await imgData.data

    // Update images state
    await setImages(memes)
  }

  // Handle input elements
  function handleInputChange(event) {
    if (event.target.name === 'text-top') {
      // Update textTop state
      setTextTop(event.target.value)
    } else {
      // Update textBottom state
      setTextBottom(event.target.value)
    }
  }

  // Choose random images from images fetched from api.imgflip.com
  function handleImageChange() {
    // Choose random image
    const image = images[Math.floor(Math.random() * images.length)]

    // Update activeImage state
    setActiveImage(image.url)
  }

  // Handle image upload via file input
  function handleImageInputChange(event) {
    // Update activeImage state
    setActiveImage(window.URL.createObjectURL(event.target.files[0]))
  }

  // Handle meme generation
  function handleMemeGeneration() {
    setIsLoadingGenerator(true);
    // Remove any existing images
    if (resultContainerRef.current.childNodes.length > 0) {
      resultContainerRef.current.removeChild(resultContainerRef.current.childNodes[0])
    }

    // Generate meme image from the content of 'content' div
    domtoimage.toPng(contentContainerRef.current).then((dataUrl) => {

      fetch(dataUrl)
      .then(res => res.blob())
      .then((blob) => {
        const formData = new FormData();
        formData.append("file", blob);
        const CDN_URL = 'https://siasky.net/skynet/skyfile/';
        return fetch(CDN_URL, {
          method: "POST",
          body: formData
        })
        .then(response => response.json())
        .then(function (json) {
          const uploaded_url = json["skylink"];
          const a = document.createElement('a');
          a.target = '_blank';
          a.href = `https://siasky.net/${uploaded_url}`;
          a.innerText = 'Meme Link';
          resultContainerRef.current.appendChild(a);
          setIsMemeGenerated(true)
          setIsLoadingGenerator(false);
        });
      });
    })
  }

  // Handle resetting the meme generator/removing existing pictures
  function handleMemeReset() {
    // Remove existing child node inside result container (generated meme image)
    resultContainerRef.current.removeChild(resultContainerRef.current.childNodes[0])

    // Update state for isMemeGenerated
    setIsMemeGenerated(false)
    setIsLoadingGenerator(false);
  }

  // Fetch images from https://api.imgflip.com/get_memes when app mounts
  React.useEffect(() => {
    // Call fetchImage method
    fetchImage()
  }, [])

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark">
        <div style={{width: "90%"}}>
            <Navbar.Brand href="/">
                <b>Meme Generator</b>
            </Navbar.Brand>
        </div>
      </Navbar>
      {/* Add Form component */}
      <br/>
      <Form
        textTop={textTop}
        textBottom={textBottom}
        handleImageInputChange={handleImageInputChange}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleMemeGeneration={handleMemeGeneration}
        handleMemeReset={handleMemeReset}
        isMemeGenerated={isMemeGenerated}
        isLoadingGenerator={isLoadingGenerator}
      />

      {/* Add Result component */}
      <br/>
      <Result resultContainerRef={resultContainerRef} />

      {/* Add Content component */}
      <Content
        activeImage={activeImage}
        contentContainerRef={contentContainerRef}
        textBottom={textBottom}
        textTop={textTop}
      />

    </div>
  )
}

// Render the App in the DOM
const rootElement = document.getElementById('root')
render(<App />, rootElement)
