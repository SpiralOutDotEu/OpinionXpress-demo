import { useState, ChangeEvent, FormEvent } from 'react';

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    setFile(selectedFile || null);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      console.error('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('File uploaded successfully!');
        // Handle success, e.g., show a success message
      } else {
        console.error('File upload failed.');
        // Handle failure, e.g., show an error message
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="max-w-md mx-auto">
      <label htmlFor="pdf" className="block text-sm font-medium text-gray-700">
        Upload PDF:
      </label>
      <input
        type="file"
        id="pdf"
        name="pdf"
        accept=".pdf"
        onChange={handleFileChange}
        className="mt-1 mb-4 p-2 border border-gray-300 rounded-md"
      />

      <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
        Upload
      </button>
    </form>
  );
};

export default UploadForm;
