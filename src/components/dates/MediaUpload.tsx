import React, { useState, useRef } from 'react';
import './MediaUpload.css';

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size: number;
}

interface MediaUploadProps {
  existingMedia?: string[];
  onMediaChange?: (media: File[]) => void; // Ändere zu File[] anstatt MediaFile[]
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  existingMedia = [],
  onMediaChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf']
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Datei ist zu groß. Maximum: ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return 'Dateityp nicht unterstützt';
    }

    return null;
  };

  const processFiles = async (files: FileList) => {
    if (mediaFiles.length + files.length > maxFiles) {
      alert(`Maximal ${maxFiles} Dateien erlaubt`);
      return;
    }

    setUploading(true);
    const newMediaFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      const mediaFile: MediaFile = {
        id: Date.now().toString() + i,
        file,
        url: URL.createObjectURL(file),
        type: getFileType(file),
        name: file.name,
        size: file.size
      };

      newMediaFiles.push(mediaFile);
    }

    const updatedMedia = [...mediaFiles, ...newMediaFiles];
    setMediaFiles(updatedMedia);
    
    // Gib nur die File-Objekte zurück, nicht die MediaFile-Objekte
    const fileObjects = updatedMedia.map(media => media.file);
    onMediaChange?.(fileObjects);
    
    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeMedia = (id: string) => {
    const updatedMedia = mediaFiles.filter(media => media.id !== id);
    setMediaFiles(updatedMedia);
    
    // Gib nur die File-Objekte zurück
    const fileObjects = updatedMedia.map(media => media.file);
    onMediaChange?.(fileObjects);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const renderMediaPreview = (media: MediaFile) => {
    switch (media.type) {
      case 'image':
        return (
          <div className="media-preview image-preview">
            <img src={media.url} alt={media.name} />
            <div className="media-overlay">
              <button
                className="remove-btn"
                onClick={() => removeMedia(media.id)}
                title="Entfernen"
              >
                ×
              </button>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="media-preview video-preview">
            <video src={media.url} controls />
            <div className="media-overlay">
              <button
                className="remove-btn"
                onClick={() => removeMedia(media.id)}
                title="Entfernen"
              >
                ×
              </button>
            </div>
          </div>
        );
      
      case 'document':
        return (
          <div className="media-preview document-preview">
            <div className="document-icon">📄</div>
            <div className="document-info">
              <div className="document-name">{media.name}</div>
              <div className="document-size">{formatFileSize(media.size)}</div>
            </div>
            <button
              className="remove-btn"
              onClick={() => removeMedia(media.id)}
              title="Entfernen"
            >
              ×
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="media-upload">
      <div className="media-upload-header">
        <h4>📸 Fotos & Medien</h4>
        <span className="file-count">
          {mediaFiles.length} / {maxFiles} Dateien
        </span>
      </div>

      <div
        className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        <div className="drop-zone-content">
          {uploading ? (
            <div className="upload-spinner">
              <div className="spinner"></div>
              <p>Dateien werden verarbeitet...</p>
            </div>
          ) : (
            <>
              <div className="drop-zone-icon">📎</div>
              <p className="drop-zone-text">
                Dateien hier ablegen oder <span className="click-text">klicken zum Auswählen</span>
              </p>
              <p className="drop-zone-hint">
                Unterstützt: Bilder, Videos, PDFs (max. {maxFileSize}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {mediaFiles.length > 0 && (
        <div className="media-gallery">
          <h5>Hinzugefügte Medien:</h5>
          <div className="media-grid">
            {mediaFiles.map(media => (
              <div key={media.id} className="media-item">
                {renderMediaPreview(media)}
                <div className="media-info">
                  <div className="media-name" title={media.name}>
                    {media.name}
                  </div>
                  <div className="media-size">
                    {formatFileSize(media.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingMedia.length > 0 && (
        <div className="existing-media">
          <h5>Vorhandene Medien:</h5>
          <div className="existing-media-list">
            {existingMedia.map((url, index) => (
              <div key={index} className="existing-media-item">
                <img src={url} alt={`Media ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload; 