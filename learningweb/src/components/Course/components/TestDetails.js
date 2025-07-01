import React from "react";
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import TestShow from "../../Test/TestShow";

const TestDetails = ({ test, moduleDetails, handleModuleClick }) => {
  return (
    <div className="relative w-full">
      {/* Close button positioned at top right of test content */}
      <div className="absolute top-2 right-2 z-10">
        <IconButton
          className="bg-white shadow-lg hover:bg-red-50 transition-colors duration-300 border border-gray-200"
          onClick={() => handleModuleClick(moduleDetails?.id)}
          size="small"
        >
          <CloseIcon className="text-red-500" fontSize="small" />
        </IconButton>
      </div>
      
      {/* Test content */}
      <div className="w-full">
        <TestShow test={test} />
      </div>
    </div>
  );
};

export default TestDetails;