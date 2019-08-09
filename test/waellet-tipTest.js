/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

const Ae = require('@aeternity/aepp-sdk').Universal;
const Crypto = require('@aeternity/aepp-sdk').Crypto;
const Bytes = require('@aeternity/aepp-sdk/es/utils/bytes');
const blake2b = require('blake2b');

const config = {
    host: 'http://localhost:3001/',
    internalHost: 'http://localhost:3001/internal/',
    compilerUrl: 'http://localhost:3080'
};


const Deployer = require('forgae-lib').Deployer;
const WAELLET_CONTRACT_PATH = "./contracts/waellet-tip.aes";

describe('Waellet Tip Contract', () => {

    let ownerKeypair, otherKeypair, owner, otherClient, contract;

    before(async () => {
        ownerKeypair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeypair,
            nativeMode: true,
            networkId: 'ae_devnet',
            compilerUrl: config.compilerUrl
        });

        otherKeypair = wallets[1];
        otherClient = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: otherKeypair,
            nativeMode: true,
            networkId: 'ae_devnet',
            compilerUrl: config.compilerUrl
        });
    });

    const hashTopic = topic => blake2b(32).update(Buffer.from(topic)).digest('hex');
    const topicHashFromResult = result => Bytes.toBytes(result.result.log[0].topics[0], true).toString('hex');

    beforeEach(async () => {
        let contractSource = utils.readFileRelative(WAELLET_CONTRACT_PATH, 'utf-8');
        contract = await owner.getContractInstance(contractSource);
        const contractInstance = await contract.deploy([]);
        assert.equal(contractInstance.result.returnType, 'ok');
    });

    it('Deploying Waellet Tip Contract', async () => {
        const contractInstance = await contract.deploy([]);
        assert.equal(contractInstance.result.returnType, 'ok');
    });

    it('Should Claim domain ownership', async () => {
        let contractSource = utils.readFileRelative(WAELLET_CONTRACT_PATH, 'utf-8');
        let deployTestContract = await owner.getContractInstance(contractSource);

        const deploy = await deployTestContract.deploy([]);
        assert.equal(deploy.result.returnType, 'ok');

        const domain = 'hack.bg';
        const challengeExpected = hashTopic(domain);
        const claim = await deployTestContract.methods.claim(domain).catch(e => e);
        assert.equal(claim.decodedResult, challengeExpected.toUpperCase());
    });

    it('Should Verify domain ownership', async () => {
        let contractSource = utils.readFileRelative(WAELLET_CONTRACT_PATH, 'utf-8');
        let deployTestContract = await owner.getContractInstance(contractSource);

        const deploy = await deployTestContract.deploy([]);
        assert.equal(deploy.result.returnType, 'ok');

        const domain = 'hack.bg';
        const challengeExpected = hashTopic(domain);
        const claim = await deployTestContract.methods.claim(domain).catch(e => e);
        assert.equal(claim.decodedResult, challengeExpected.toUpperCase());

        const verify = await deployTestContract.methods.verify(domain).catch(e => e);
        assert.equal(verify.decodedResult, true);
    });

    it('Should Tip known domain', async () => {
        let contractSource = utils.readFileRelative(WAELLET_CONTRACT_PATH, 'utf-8');
        let deployTestContract = await owner.getContractInstance(contractSource);

        const deploy = await deployTestContract.deploy([]);
        assert.equal(deploy.result.returnType, 'ok');

        const domain = 'hack.bg';
        const challengeExpected = hashTopic(domain);
        const claim = await deployTestContract.methods.claim(domain).catch(e => e);
        assert.equal(claim.decodedResult, challengeExpected.toUpperCase());

        const tip = await deployTestContract.methods.tip(domain).catch(e => e);
        assert.equal(tip.decodedResult, true);
    });

    it('Should Tip unknown domain', async () => {
        let contractSource = utils.readFileRelative(WAELLET_CONTRACT_PATH, 'utf-8');
        let deployTestContract = await owner.getContractInstance(contractSource);

        const deploy = await deployTestContract.deploy([]);
        assert.equal(deploy.result.returnType, 'ok');

        const domain = 'hack.bg';

        const tip = await deployTestContract.methods.tip(domain).catch(e => e);
        assert.equal(tip.decodedResult, true);
    });
})