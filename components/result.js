import React, { useEffect, useMemo, startTransition, useCallback } from 'react'
// import copy from 'clipboard-copy'
import saveAs from 'file-saver'
import { Leva, useControls, button } from 'leva'
// import toast from 'react-hot-toast'
import { isGlb, isGltf, isZip } from '../utils/isExtension'
import useSandbox from '../utils/useSandbox'
import Viewer from './viewer'
// import Code from './code'
import useStore from '../utils/store'
import { loadFileAsArrayBuffer } from '../utils/buffers'
import JSZip from 'jszip'
import { encode as arrayBufferToBase64 } from 'base64-arraybuffer';
import FileDropSmall from './fileDropSmall'

const Result = () => {
  const { buffers, fileName, scene, code, generateScene } = useStore()

  const preview = useControls(
    'preview',
    {
      autoRotate: false,
      // contactShadow: true,
      intensity: { value: 1, min: 0, max: 2, step: 0.1, label: 'light intensity' },
      preset: {
        value: 'rembrandt',
        options: ['rembrandt', 'portrait', 'upfront', 'soft'],
      },
      environment: {
        value: 'city',
        options: ['', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
      },
    },
    { collapsed: false },
  )

  const [loading, sandboxId, error, sandboxCode] = useSandbox({
    buffers,
    code,
    config: { ...preview },
  })

  useEffect(() => {
    startTransition(() => {
      generateScene()
    })
  }, [])

  const exports = useMemo(() => {
    const temp = {}

    if (!isGlb(fileName) && !error) {
      const name = 'codesandbox' + (loading ? ' loading' : '')
      temp[name] = button(() => {
        location.href = sandboxId
          ? `https://codesandbox.io/s/${sandboxId}?file=/src/Model.js}`
          : '#'
      })
    }

    temp['download image'] = button(() => {
      var image = document
        .getElementsByTagName('canvas')[0]
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')

      saveAs(image, `${fileName.split('.')[0]}.png`)
    })

    return temp
  }, [fileName, loading, error, sandboxCode, sandboxId])

  useControls(exports, { collapsed: true }, [exports])

  const onDrop = useCallback(async (acceptedFiles) => {
    const buffers = new Map();

    // load all files as arrayBuffer in the buffers map
    await Promise.all(
      acceptedFiles.map((file) =>
        loadFileAsArrayBuffer(file).then((buffer) => buffers.set(file.path.replace(/^\//, ''), buffer))
      )
    );

    // unzip files
    for (const [path, buffer] of buffers.entries()) {
      if (isZip(path)) {
        const { files } = await JSZip.loadAsync(buffer);
        for (const [path, file] of Object.entries(files)) {
          const buffer = await file.async('arraybuffer');
          buffers.set(path, buffer);
        }
        buffers.delete(path);
      }
    }

    const filePath = Array.from(buffers.keys()).find((path) => isGlb(path) || isGltf(path));

    useStore.setState({
      buffers,
      fileName: filePath,
      textOriginalFile: btoa(arrayBufferToBase64(buffers.get(filePath))),
    });

    generateScene()
  }, []);

  return (
    <div className="h-full w-screen">
      {!code && !scene ? (
        <p className="text-4xl font-bold w-screen h-screen flex justify-center items-center">Loading ...</p>
      ) : (
        <div className="h-full">
          <section className="h-full w-full">{scene && <Viewer {...preview} />}</section>
          <FileDropSmall onDrop={onDrop} />
        </div>
      )}
      <Leva hideTitleBar collapsed />
    </div>
  )
}

export default Result
