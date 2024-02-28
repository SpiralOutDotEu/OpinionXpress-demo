// components/CenteredForm.js
import React from 'react';

const CenteredForm = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Poll 1</h1>

        <form action="#" method="post">
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-600">
              Question:
            </label>
            <p className="text-gray-800">Are you sure that you agree?</p>
          </div>

          <div className="mb-4">
            <label htmlFor="input" className="block text-sm font-medium text-gray-600">
              Answer:
            </label>
            <input
              type="text"
              id="input"
              name="input"
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded-md w-full">
            Submit
          </button>
        </form>
      </div>
    </div>
  );

export default CenteredForm;
