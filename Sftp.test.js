const SFTPClient = require('./your-sftp-client-file'); // Adjust the path accordingly

jest.mock('ssh2-sftp-client');

describe('SFTPClient', () => {
  let sftpClient;

  beforeEach(() => {
    sftpClient = new SFTPClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the SFTP server', async () => {
    const options = { host: 'example.com', port: 22, username: 'user', password: 'pass' };

    await sftpClient.connect(options);

    expect(sftpClient.client.connect).toHaveBeenCalledWith(options);
  });

  it('should handle connection failure', async () => {
    const options = { host: 'example.com', port: 22, username: 'user', password: 'pass' };

    sftpClient.client.connect.mockRejectedValue(new Error('Connection failed'));

    await expect(sftpClient.connect(options)).rejects.toThrow('Connection failed');
  });

  it('should disconnect from the SFTP server', async () => {
    await sftpClient.disconnect();

    expect(sftpClient.client.end).toHaveBeenCalled();
  });

  it('should list files on the remote directory', async () => {
    const remoteDir = '/path/to/remote';
    const fileGlob = '*.txt';
    const fileObjects = [{ name: 'file1.txt', type: '-', size: 1024, modifyTime: Date.now() }];

    sftpClient.client.list.mockResolvedValue(fileObjects);

    const result = await sftpClient.listFiles(remoteDir, fileGlob);

    expect(sftpClient.client.list).toHaveBeenCalledWith(remoteDir, fileGlob);
    expect(result).toEqual(['file1.txt']);
  });

  it('should handle listing failure', async () => {
    const remoteDir = '/path/to/remote';
    const fileGlob = '*.txt';

    sftpClient.client.list.mockRejectedValue(new Error('Listing failed'));

    await expect(sftpClient.listFiles(remoteDir, fileGlob)).rejects.toThrow('Listing failed');
  });

  it('should upload a file to the remote server', async () => {
    const localFile = 'local/file.txt';
    const remoteFile = '/path/to/remote/file.txt';

    await sftpClient.uploadFile(localFile, remoteFile);

    expect(sftpClient.client.put).toHaveBeenCalledWith(localFile, remoteFile);
  });

  it('should handle upload failure', async () => {
    const localFile = 'local/file.txt';
    const remoteFile = '/path/to/remote/file.txt';

    sftpClient.client.put.mockRejectedValue(new Error('Upload failed'));

    await expect(sftpClient.uploadFile(localFile, remoteFile)).rejects.toThrow('Upload failed');
  });

  it('should download a file from the remote server', async () => {
    const remoteFile = '/path/to/remote/file.txt';
    const localFile = 'local/file.txt';

    await sftpClient.downloadFile(remoteFile, localFile);

    expect(sftpClient.client.get).toHaveBeenCalledWith(remoteFile, localFile);
  });

  it('should handle download failure', async () => {
    const remoteFile = '/path/to/remote/file.txt';
    const localFile = 'local/file.txt';

    sftpClient.client.get.mockRejectedValue(new Error('Download failed'));

    await expect(sftpClient.downloadFile(remoteFile, localFile)).rejects.toThrow('Download failed');
  });

  it('should delete a file on the remote server', async () => {
    const remoteFile = '/path/to/remote/file.txt';

    await sftpClient.deleteFile(remoteFile);

    expect(sftpClient.client.delete).toHaveBeenCalledWith(remoteFile);
  });

  it('should handle deletion failure', async () => {
    const remoteFile = '/path/to/remote/file.txt';

    sftpClient.client.delete.mockRejectedValue(new Error('Deletion failed'));

    await expect(sftpClient.deleteFile(remoteFile)).rejects.toThrow('Deletion failed');
  });
});
