import { useAssetFiles } from '../../queries/assets';

const API_BASE = 'https://api.refgenie.org/v4';

type Props = {
  assetDigest: string;
};

// Download links for a file-mode asset (serving_modes includes "file" but has
// no archive tarball). Lists the asset's individual files; each links to the
// server file-download route, which 307-redirects to S3.
function FileDownloads({ assetDigest }: Props) {
  const { data } = useAssetFiles(assetDigest);
  const files: string[] = data?.files ?? [];

  if (!files.length) {
    return null;
  }

  return (
    <>
      {files.map((file: string) => (
        <a
          key={file}
          className='btn btn-secondary btn-xs px-2 py-1 ms-1'
          href={`${API_BASE}/assets/${assetDigest}/files/${file}`}
          onClick={(e) => e.stopPropagation()}
        >
          {file}
        </a>
      ))}
    </>
  );
}

export default FileDownloads;
