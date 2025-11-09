import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { TypeAnimation } from "react-type-animation";
import { toast } from "react-toastify";
import {
  FaCopy,
  FaShareAlt,
  FaDownload,
  FaTrash,
} from "react-icons/fa";

const ImageToTextOCR = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showText, setShowText] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setResult("");
      setShowText(false);
    },
  });

  // ✅ Copy text
  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  // ✅ Download text
  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "extracted_text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Text downloaded!");
  };

  // ✅ Share text
  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: "Extracted Text",
          text: result,
        });
      } catch (err) {
        toast.error("Sharing cancelled or failed!");
      }
    } else {
      await handleCopy();
      toast.info("Sharing not supported. Text copied instead!");
    }
  };

  // ✅ Clear text
  const handleClear = () => {
    setResult("");
    setShowText(false);
    toast.info("Cleared output!");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", "easyocr");

    setLoading(true);
    setShowText(false);
    try {
      const res = await axios.post("http://127.0.0.1:8000/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.text);
      setShowText(true);
      toast.success("Text extracted successfully!");
    } catch (error) {
      toast.error("Failed to extract text!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10 px-6">
      <h1 className="text-3xl font-bold mb-10 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
        📸 Image to Text OCR System
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
        {/* 🔹 Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col items-center justify-center"
        >
          <div
            {...getRootProps()}
            className="w-full border-2 border-dashed border-blue-500 rounded-xl p-10 text-center cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <input {...getInputProps()} />
            {!file ? (
              <p className="text-gray-300">📤 Drag & drop or click to select image</p>
            ) : (
              <p className="text-cyan-400">{file.name}</p>
            )}
          </div>

          {file && (
            <div className="mt-6">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-72 h-72 object-cover rounded-lg border border-white/20 shadow-md"
              />
            </div>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-40 h-10"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Extract Text"}
          </Button>
        </motion.div>

        {/* 🔹 Text Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl overflow-y-auto flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-400">🧠 Extracted Text</h2>

            {result && (
              <div className="flex items-center gap-3">
                <Tooltip title="Copy Text">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white/10 hover:bg-blue-500/30 transition"
                  >
                    <FaCopy />
                  </button>
                </Tooltip>

                <Tooltip title="Download Text">
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-white/10 hover:bg-green-500/30 transition"
                  >
                    <FaDownload />
                  </button>
                </Tooltip>

                <Tooltip title="Share Text">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-white/10 hover:bg-yellow-500/30 transition"
                  >
                    <FaShareAlt />
                  </button>
                </Tooltip>

                <Tooltip title="Clear Output">
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/30 transition"
                  >
                    <FaTrash />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Text Output */}
          <div className="flex-1 text-gray-200">
            {!result && !loading && (
              <p className="text-gray-400 italic">
                Upload an image to extract text here...
              </p>
            )}

            {showText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg leading-relaxed mt-2"
              >
                <TypeAnimation
                  sequence={[result, 500]}
                  wrapper="div"
                  speed={40}
                  style={{ whiteSpace: "pre-line" }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <p className="text-gray-400 mt-8 text-sm">
        © {new Date().getFullYear()} Raj Patel — OCR AI System
      </p>
    </div>
  );
};

export default ImageToTextOCR;
