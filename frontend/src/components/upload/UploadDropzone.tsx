import { useCallback, useMemo, useRef, useState } from 'react';
import { FileImage, FileUp, Loader2, ShieldCheck, X } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 20;

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  progress: number;
  busy: boolean;
}

export function UploadDropzone({ onUpload, progress, busy }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readableTypes = useMemo(() => 'JPG, PNG, or PDF up to 20 MB', []);

  const validate = useCallback((nextFile: File) => {
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      return 'MetaNest accepts JPG, PNG, and PDF floor plans.';
    }
    if (nextFile.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size must stay below ${MAX_SIZE_MB} MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    async (nextFile?: File) => {
      if (!nextFile || busy) return;
      const validationError = validate(nextFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setFile(nextFile);
      setPreview(nextFile.type === 'application/pdf' ? null : URL.createObjectURL(nextFile));
      await onUpload(nextFile);
    },
    [busy, onUpload, validate],
  );

  return (
    <section className="glass scanline rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-teal-200">Floor Plan Intake</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Upload Blueprint</h2>
        </div>
        <ShieldCheck className="h-7 w-7 text-mint" aria-hidden />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={`flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
          dragging ? 'border-teal-300 bg-teal-300/10' : 'border-white/16 bg-white/[0.04] hover:border-white/32'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        {preview ? (
          <img src={preview} alt="Uploaded floor plan preview" className="max-h-52 rounded-md object-contain shadow-glow" />
        ) : file?.type === 'application/pdf' ? (
          <div className="flex flex-col items-center gap-3">
            <FileImage className="h-16 w-16 text-ember" aria-hidden />
            <span className="text-sm text-slate-200">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="rounded-full border border-teal-200/30 bg-teal-200/10 p-5">
              <FileUp className="h-10 w-10 text-teal-200" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-medium text-white">Drop a plan here or select a file</p>
              <p className="mt-2 text-sm text-slate-300">{readableTypes}</p>
            </div>
          </div>
        )}
      </button>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          <X className="h-4 w-4" aria-hidden />
          {error}
        </div>
      ) : null}

      {busy ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-teal-200" aria-hidden />
              AI analysis in progress
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-mint to-ember transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

