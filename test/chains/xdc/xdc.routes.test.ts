import request from 'supertest';
import { patch, unpatch } from '../../services/patch';
import { gatewayApp } from '../../../src/app';
import {
  NETWORK_ERROR_CODE,
  UNKNOWN_ERROR_ERROR_CODE,
  NETWORK_ERROR_MESSAGE,
  UNKNOWN_ERROR_MESSAGE,
} from '../../../src/services/error-handler';
import * as transactionSuccesful from '../ethereum/fixtures/transaction-succesful.json';
import * as transactionSuccesfulReceipt from '../ethereum/fixtures/transaction-succesful-receipt.json';
import * as transactionOutOfGas from '../ethereum/fixtures/transaction-out-of-gas.json';
import * as transactionOutOfGasReceipt from '../ethereum/fixtures/transaction-out-of-gas-receipt.json';
import { Xdc } from '../../../src/chains/xdc/xdc';
let xdc: Xdc;

const address: string = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';

beforeAll(async () => {
  xdc = Xdc.getInstance('apothem');
});

afterAll(async () => {
  await xdc.close();
});

afterEach(unpatch);

const patchGetWallet = () => {
  patch(xdc, 'getWallet', () => {
    return {
      address,
    };
  });
};

const patchGetNonce = () => {
  patch(xdc.nonceManager, 'getNonce', () => 2);
};

const patchGetTokenBySymbol = () => {
  patch(xdc, 'getTokenBySymbol', () => {
    return {
      chainId: 51,
      address: '0xaD2552941efbAc1532B5C8950EcCdb3EA9DFE68b',
      decimals: 18,
      name: 'Wrapped XDC',
      symbol: 'WXDC',
      logoURI: '',
    };
  });
};

const patchApproveERC20 = () => {
  patch(xdc, 'approveERC20', () => {
    return {
      type: 2,
      chainId: 43114,
      nonce: 115,
      maxPriorityFeePerGas: { toString: () => '106000000000' },
      maxFeePerGas: { toString: () => '106000000000' },
      gasPrice: { toString: () => null },
      gasLimit: { toString: () => '100000' },
      to: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
      value: { toString: () => '0' },
      data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', // noqa: mock
      accessList: [],
      hash: '0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9', // noqa: mock
      v: 0,
      r: '0xbeb9aa40028d79b9fdab108fcef5de635457a05f3a254410414c095b02c64643', // noqa: mock
      s: '0x5a1506fa4b7f8b4f3826d8648f27ebaa9c0ee4bd67f569414b8cd8884c073100', // noqa: mock
      from: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
      confirmations: 0,
    };
  });
};

const patchGetERC20Allowance = () => {
  patch(xdc, 'getERC20Allowance', () => ({ value: 1, decimals: 3 }));
};

const patchGetNativeBalance = () => {
  patch(xdc, 'getNativeBalance', () => ({ value: 1, decimals: 3 }));
};

const patchGetERC20Balance = () => {
  patch(xdc, 'getERC20Balance', () => ({ value: 1, decimals: 3 }));
};

describe('POST /evm/nonce', () => {
  it('should return 200', async () => {
    patchGetWallet();
    patchGetNonce();

    await request(gatewayApp)
      .post(`/evm/nonce`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => expect(res.body.nonce).toBe(2));
  });

  it('should return 404 when parameters are invalid', async () => {
    await request(gatewayApp)
      .post(`/evm/nonce`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address: 'da857cbda0ba96757fed842617a4',
      })
      .expect(404);
  });
});

describe('POST /evm/approve', () => {
  it('should return 200 for spender as xdc', async () => {
    patchGetWallet();
    xdc.getContract = jest.fn().mockReturnValue({
      address,
    });
    patch(xdc.nonceManager, 'getNonce', () => 115);
    patchGetTokenBySymbol();
    patchApproveERC20();

    await request(gatewayApp)
      .post(`/evm/approve`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address,
        spender: 'xsswap',
        token: 'PNG',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res: any) => {
        expect(res.body.nonce).toEqual(115);
      });
  });

  it('should return 200 for a spender addressed prefixed with xdc', async () => {
    patchGetWallet();
    xdc.getContract = jest.fn().mockReturnValue({
      address,
    });
    patch(xdc.nonceManager, 'getNonce', () => 115);
    patchGetTokenBySymbol();
    patchApproveERC20();

    await request(gatewayApp)
      .post(`/evm/approve`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address,
        spender: 'xdc010216bB52E46807a07d0101Bb828bA547534F37',
        token: 'PNG',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res: any) => {
        expect(res.body.nonce).toEqual(115);
      });
  });

  it('should return 200 for a spender addressed prefixed with 0x', async () => {
    patchGetWallet();
    xdc.getContract = jest.fn().mockReturnValue({
      address,
    });
    patch(xdc.nonceManager, 'getNonce', () => 115);
    patchGetTokenBySymbol();
    patchApproveERC20();

    await request(gatewayApp)
      .post(`/evm/approve`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address,
        spender: '0x010216bB52E46807a07d0101Bb828bA547534F37',
        token: 'PNG',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res: any) => {
        expect(res.body.nonce).toEqual(115);
      });
  });

  it('should return 404 when parameters are invalid', async () => {
    await request(gatewayApp)
      .post(`/evm/approve`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address,
        spender: 'xsswap',
        token: 123,
        nonce: '23',
      })
      .expect(404);
  });
});

describe('POST /evm/allowances', () => {
  it('should return 200 asking for allowances when spender is an 0x address', async () => {
    patchGetWallet();
    patchGetTokenBySymbol();
    const spender = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
    xdc.getSpender = jest.fn().mockReturnValue(spender);
    xdc.getContract = jest.fn().mockReturnValue({
      address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
    });
    patchGetERC20Allowance();

    await request(gatewayApp)
      .post(`/evm/allowances`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        spender: spender,
        tokenSymbols: ['WETH', 'DAI'],
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => expect(res.body.spender).toEqual(spender))
      .expect((res) => expect(res.body.approvals.WETH).toEqual('0.001'))
      .expect((res) => expect(res.body.approvals.DAI).toEqual('0.001'));
  });

  it('should return 200 asking for allowances for an xdc address', async () => {
    patchGetWallet();
    patchGetTokenBySymbol();
    const spender = 'xdcFaA12FD102FE8623C9299c72B03E45107F2772B5';
    xdc.getSpender = jest.fn().mockReturnValue(spender);
    xdc.getContract = jest.fn().mockReturnValue({
      address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
    });
    patchGetERC20Allowance();

    await request(gatewayApp)
      .post(`/evm/allowances`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        spender: spender,
        tokenSymbols: ['WETH', 'DAI'],
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => expect(res.body.spender).toEqual(spender))
      .expect((res) => expect(res.body.approvals.WETH).toEqual('0.001'))
      .expect((res) => expect(res.body.approvals.DAI).toEqual('0.001'));
  });
});

describe('POST /network/balances', () => {
  it('should return 200 asking for supported tokens', async () => {
    patchGetWallet();
    patchGetTokenBySymbol();
    patchGetNativeBalance();
    patchGetERC20Balance();
    xdc.getContract = jest.fn().mockReturnValue({
      address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
    });

    await request(gatewayApp)
      .post(`/network/balances`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        tokenSymbols: ['WETH', 'DAI'],
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => expect(res.body.balances.WETH).toBeDefined())
      .expect((res) => expect(res.body.balances.DAI).toBeDefined());
  });
});

describe('POST /evm/cancel', () => {
  it('should return 200', async () => {
    // override getWallet (network call)
    xdc.getWallet = jest.fn().mockReturnValue({
      address,
    });

    xdc.cancelTx = jest.fn().mockReturnValue({
      hash: '0xf6b9e7cec507cb3763a1179ff7e2a88c6008372e3a6f297d9027a0b39b0fff77', // noqa: mock
    });

    await request(gatewayApp)
      .post(`/evm/cancel`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address,
        nonce: 23,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res: any) => {
        expect(res.body.txHash).toEqual(
          '0xf6b9e7cec507cb3763a1179ff7e2a88c6008372e3a6f297d9027a0b39b0fff77' // noqa: mock
        );
      });
  });

  it('should return 404 when parameters are invalid', async () => {
    await request(gatewayApp)
      .post(`/evm/cancel`)
      .send({
        chain: 'xdc',
        network: 'apothem',
        address: '',
        nonce: '23',
      })
      .expect(404);
  });
});

describe('POST /network/poll', () => {
  it('should get a NETWORK_ERROR_CODE when the network is unavailable', async () => {
    patch(xdc, 'getCurrentBlockNumber', () => {
      const error: any = new Error('something went wrong');
      error.code = 'NETWORK_ERROR';
      throw error;
    });

    const res = await request(gatewayApp).post('/network/poll').send({
      chain: 'xdc',
      network: 'apothem',
      txHash:
        '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362', // noqa: mock
    });

    expect(res.statusCode).toEqual(503);
    expect(res.body.errorCode).toEqual(NETWORK_ERROR_CODE);
    expect(res.body.message).toEqual(NETWORK_ERROR_MESSAGE);
  });

  it('should get a UNKNOWN_ERROR_ERROR_CODE when an unknown error is thrown', async () => {
    patch(xdc, 'getCurrentBlockNumber', () => {
      throw new Error();
    });

    const res = await request(gatewayApp).post('/network/poll').send({
      chain: 'xdc',
      network: 'apothem',
      txHash:
        '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362', // noqa: mock
    });

    expect(res.statusCode).toEqual(503);
    expect(res.body.errorCode).toEqual(UNKNOWN_ERROR_ERROR_CODE);
  });

  it('should get a null in txReceipt for Tx in the mempool', async () => {
    patch(xdc, 'getCurrentBlockNumber', () => 1);
    patch(xdc, 'getTransaction', () => transactionOutOfGas);
    patch(xdc, 'getTransactionReceipt', () => null);
    const res = await request(gatewayApp).post('/network/poll').send({
      chain: 'xdc',
      network: 'apothem',
      txHash:
        '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362', // noqa: mock
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.txReceipt).toEqual(null);
    expect(res.body.txData).toBeDefined();
  });

  it('should get a null in txReceipt and txData for Tx that didnt reach the mempool and TxReceipt is null', async () => {
    patch(xdc, 'getCurrentBlockNumber', () => 1);
    patch(xdc, 'getTransaction', () => null);
    patch(xdc, 'getTransactionReceipt', () => null);
    const res = await request(gatewayApp).post('/network/poll').send({
      chain: 'xdc',
      network: 'apothem',
      txHash:
        '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362', // noqa: mock
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.txReceipt).toEqual(null);
    expect(res.body.txData).toEqual(null);
  });

  it('should get txStatus = 1 for a succesful query', async () => {
    patch(xdc, 'getCurrentBlockNumber', () => 1);
    patch(xdc, 'getTransaction', () => transactionSuccesful);
    patch(xdc, 'getTransactionReceipt', () => transactionSuccesfulReceipt);
    const res = await request(gatewayApp).post('/network/poll').send({
      chain: 'xdc',
      network: 'apothem',
      txHash:
        '0x6d068067a5e5a0f08c6395b31938893d1cdad81f54a54456221ecd8c1941294d', // noqa: mock
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.txReceipt).toBeDefined();
    expect(res.body.txData).toBeDefined();
  });

  it('should get unknown error', async () => {
    patch(xdc, 'getCurrentBlockNumber', () => {
      const error: any = new Error('something went wrong');
      error.code = -32006;
      throw error;
    });
    const res = await request(gatewayApp).post('/network/poll').send({
      chain: 'xdc',
      network: 'apothem',
      txHash:
        '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362', // noqa: mock
    });
    expect(res.statusCode).toEqual(503);
    expect(res.body.errorCode).toEqual(UNKNOWN_ERROR_ERROR_CODE);
    expect(res.body.message).toEqual(UNKNOWN_ERROR_MESSAGE);
  });
});
