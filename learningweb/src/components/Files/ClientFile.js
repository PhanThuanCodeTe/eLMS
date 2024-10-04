import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, Button, ProgressBar } from "react-bootstrap";
import { FaDownload, FaFile, FaUpload } from 'react-icons/fa';
import { authAPIs, endpoints } from "../../configs/APIs";

const ClientFile = ({ moduleId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [moduleId]);

    const fetchFiles = async () => {
        if (!moduleId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await authAPIs().get(endpoints["module-file"](moduleId));
            setFiles(response.data);
        } catch (err) {
            console.error("Error fetching files:", err);
            setError("Could not load files.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await authAPIs().post(endpoints["module-file"](moduleId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            await fetchFiles(); // Refresh file list
            setUploadProgress(0);
        } catch (err) {
            console.error("Error uploading file:", err);
            alert("Failed to upload file. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await authAPIs().get(
                `${endpoints["module-file"](moduleId)}${fileId}/download/`, 
                { responseType: 'blob' }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading file:", err);
            alert("Failed to download file. Please try again.");
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Module Files</h5>
                <div>
                    <input
                        type="file"
                        id="fileUpload"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <Button 
                        variant="primary" 
                        onClick={() => document.getElementById('fileUpload').click()}
                        disabled={uploading}
                    >
                        <FaUpload className="me-1" /> Upload File
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                {uploading && (
                    <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`} 
                        className="mb-3" 
                    />
                )}
                {files.length > 0 ? (
                    <ul className="list-group">
                        {files.map((file) => (
                            <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <FaFile className="me-2" />
                                    <div>
                                        <div>{file.name || `File ${file.id}`}</div>
                                        <small className="text-muted">{file.file_type}</small>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleDownload(file.id, file.name || `file_${file.id}`)}
                                >
                                    <FaDownload className="me-1" /> Download
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No files available for this module.</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default ClientFile;