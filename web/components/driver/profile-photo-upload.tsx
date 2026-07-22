'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/avatar';
import { resolveMediaUrl } from '@/lib/media-url';
import { useUploadPhoto } from '@/hooks/use-auth';

export function ProfilePhotoUpload({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string | null;
}) {
  const t = useTranslations('driver');
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPhoto();
  const [preview, setPreview] = useState<string | null>(null);

  const displayUrl = preview ?? resolveMediaUrl(photoUrl);

  const onFile = (file: File) => {
    setPreview(URL.createObjectURL(file));
    upload.mutate(file, {
      onError: () => setPreview(null),
    });
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        className="group relative"
      >
        <Avatar src={displayUrl} name={name} size="xl" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
          {upload.isPending ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </span>
      </button>
      <p className="mt-3 text-sm font-medium text-emerald-700">
        {photoUrl || preview ? t('changePhoto') : t('uploadPhoto')}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
