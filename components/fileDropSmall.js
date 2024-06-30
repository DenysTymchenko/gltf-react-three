import { useDropzone } from 'react-dropzone'

const FileDropSmall = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
  })

  return (
    <div className="absolute top-3 left-3" {...getRootProps()}>
      <input {...getInputProps()} />

      {isDragActive ? (
        <p className="text-sm font-bold text-blue-600">Drop the files here...</p>
      ) : (
        <p className="text-sm font-bold">
          Drag {"'"}n{"'"} drop your GLTF file {" "}
          <button className="text-blue-600">here</button>
        </p>
      )}
      {fileRejections.length ? (
        <p className="block text-center text-xl pt-4 text-red-300">Only .gltf or .glb files are accepted</p>
      ) : null}
    </div>
  )
}

export default FileDropSmall;
