import { useAssetFiles } from '../../queries/assets';
import { hasCapability, useApiClient } from '../../services/api';

type Props = {
  assetDigest: string;
};

// Download links for a file-mode asset (serving_modes includes "file" but has
// no archive tarball). Lists the asset's individual files; each links to the
// server file-download route, which 307-redirects to S3. The route is
// server-only, so this renders nothing against a backend without the
// `downloads` capability (e.g. a local refgenie over the bridge).
function FileDownloads({ assetDigest }: Props) {
  const api = useApiClient();
  const { data } = useAssetFiles(assetDigest);
  const files: string[] = data?.files ?? [];

  if (!hasCapability(api, 'downloads') || !files.length) {
    return null;
  }

  return (
    <>
      {files.map((file: string) => (
        <a
          key={file}
          className='btn btn-secondary btn-xs px-2 py-1 ms-1'
          href={`${api.baseUrl}/assets/${assetDigest}/files/${file}`}
          onClick={(e) => e.stopPropagation()}
        >
          {file}
        </a>
      ))}
    </>
  );
}

export default FileDownloads;
