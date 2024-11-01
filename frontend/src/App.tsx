// frontend/src/App.tsx

import React, { useState } from "react";

const App: React.FC = () => {
  // const [name, setName] = useState("");
  // const [greeting, setGreeting] = useState("");
  const [file, setFile] = useState<File|null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ( !event.target.files || !event.target.files[0]) {
      return;
    }
    setFile(event.target.files[0]);
  };

  // const handleGreet = () => {
  //   if (google && google.script && google.script.run) {
  //     google.script.run
  //       .withSuccessHandler((msg: string) => {
  //         setGreeting(msg);
  //       })
  //       .withFailureHandler((error) => {
  //         console.error("Error:", error);
  //       })
  //       .getGreeting(name);
  //   } else {
  //     console.error("google.script.run is not available.");
  //   }
  // };

  const uploadFile =() => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      // Read the file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileType =  file.type;
        const fileName = file.name;
        console.log(reader.result);
        if(typeof reader.result != "string"){
          return;
        }
        const base64String = reader.result?.split(',')[1];
        
        google.script.run.withSuccessHandler(x=>{
          alert(`File ${x} uploaded successfully!`);
        }).importJsonFile(base64String, fileType, fileName);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload failed', error);
      alert('Failed to upload the file');
    }
  }

  return (
      <div>
        Upload file to import
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFile}>Import</button>
      </div>
  );
};

export default App;
