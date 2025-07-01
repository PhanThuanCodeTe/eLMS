import React from "react";
import { TextField, Button, CircularProgress, Alert } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const ModuleDetails = ({
  module,
  moduleDetails,
  editingModule,
  setEditingModule,
  loadingDetails,
  detailsError,
  updateModuleDetails,
  setModuleToDelete,
  setShowDeleteModal,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingModule((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditingModule((prev) => ({ ...prev, description: data }));
  };

  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loadingDetails && !moduleDetails) {
    return <CircularProgress className="mx-auto" />;
  }

  if (detailsError) {
    return <Alert severity="error">{detailsError}</Alert>;
  }

  if (!moduleDetails) {
    return <p>Bạn chưa ghi gì vào module này</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {editingModule && editingModule.id === module.id ? (
        <div className="flex flex-col gap-4">
          <TextField
            label="Tên Module"
            name="title"
            value={editingModule.title}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="YouTube URL"
            name="youtube_url"
            value={editingModule.youtube_url}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nội dung:
            </label>
            <CKEditor
              editor={ClassicEditor}
              data={editingModule.description}
              onChange={handleEditorChange}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="primary"
              onClick={() => updateModuleDetails(module.id)}
            >
              Lưu thay đổi
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditingModule(null)}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              className="ml-auto"
              onClick={() => {
                setModuleToDelete(module.id);
                setShowDeleteModal(true);
              }}
            >
              Xóa
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h5 className="text-lg font-medium">Tên Module: {moduleDetails.title}</h5>
          <p>
            <strong>YouTube URL: </strong>
            <a
              href={moduleDetails.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {moduleDetails.youtube_url}
            </a>
          </p>
          {moduleDetails.youtube_url && (
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                  moduleDetails.youtube_url
                )}`}
                allowFullScreen
                title={moduleDetails.title}
                className="w-full h-full rounded"
              ></iframe>
            </div>
          )}
          <h6 className="font-medium">Nội dung:</h6>
          <div
            className="prose"
            dangerouslySetInnerHTML={{
              __html: moduleDetails.description,
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditingModule(moduleDetails)}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setModuleToDelete(module.id);
                setShowDeleteModal(true);
              }}
            >
              Xóa
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleDetails;