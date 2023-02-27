const fs = require('fs');

const core = require('@actions/core');
const tc = require('@actions/tool-cache');

const setup = require('./src/setup-terraform-docs');

jest.mock('@actions/core');
jest.mock('@actions/tool-cache');
fs.chmodSync = jest.fn();

tc.downloadTool.mockResolvedValue('terraform-docs-v0.16.0-linux-amd64.tar.gz');
tc.extractTar.mockResolvedValue('terraform-docs');
fs.chmodSync.mockReturnValue(null);

describe('Mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('download should be called', async () => {
    await setup();

    expect(tc.downloadTool).toBeCalledTimes(1);
  });

  test('extract tar should be called', async () => {
    await setup();

    expect(tc.extractTar).toBeCalledTimes(1);
  });

  test('add path should be called', async () => {
    await setup();

    expect(core.addPath).toBeCalledTimes(1);
  });
});
