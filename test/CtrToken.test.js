// Load dependencies
const BN = web3.utils.BN;

// Import helper test
const { assertEqual } = require('./helper');

// Load compiled artifacts
const CtrToken = artifacts.require('CtrToken.sol');

// Common variables
let admin;
let ctrToken;
let user;

// Start test block
contract('CtrToken', accounts => {
    describe('Test all basic token functions', async () => {
        before('Deploy contract before run each test case', async () => {
            user = accounts[0];
            admin = accounts[1];
            ctrToken = await CtrToken.new(admin);
        });

        it('Test contract initiated values', async function () {
            // Expected values
            const expectedTotalSupply = new BN(150).mul(new BN(10).pow(new BN(24))); // 24 ~ 1M 10^6 & 10^18 decimals
            const expectedTokenName = "CreatorChain";
            const expectedTokenSymbol = "CTR";
            const expectedTokenDecimals = new BN(18);

            assertEqual(expectedTotalSupply, await ctrToken.totalSupply(), "Wrong total supply");
            assertEqual(expectedTokenName, await ctrToken.name(), "Wrong token name");
            assertEqual(expectedTokenSymbol, await ctrToken.symbol(), "Wrong token symbol");
            assertEqual(expectedTokenDecimals, await ctrToken.decimals(), "Wrong token decimals");
            assertEqual(expectedTotalSupply, await ctrToken.balanceOf(admin), "Wrong admin balance");
        });

        it(`Test token burn`, async () => {
            let adminBalance = await ctrToken.balanceOf(admin);
            let burnAmount = new BN(10).pow(new BN(18));
            let totalSupply = await ctrToken.totalSupply();

            // Expected values
            let adminBalanceAfter = adminBalance.sub(burnAmount);
            let totalSupplyAfter = totalSupply.sub(burnAmount);

            await ctrToken.burn(burnAmount, { from: admin });

            assertEqual(adminBalanceAfter, await ctrToken.balanceOf(admin));
            assertEqual(totalSupplyAfter, await ctrToken.totalSupply());
        });

        it(`Test token burnFrom`, async () => {
            let adminBalance = await ctrToken.balanceOf(admin);
            let userBalance = await ctrToken.balanceOf(user);
            let totalSupply = await ctrToken.totalSupply();
            let burnAmount = new BN(10).pow(new BN(18));

            // Expected values
            let adminBalanceAfter = adminBalance.sub(burnAmount);
            let totalSupplyAfter = totalSupply.sub(burnAmount);

            await ctrToken.approve(user, burnAmount, { from: admin });
            await ctrToken.burnFrom(admin, burnAmount, { from: user });

            assertEqual(adminBalanceAfter, await ctrToken.balanceOf(admin));
            assertEqual(totalSupplyAfter, await ctrToken.totalSupply());
            assertEqual(userBalance, await ctrToken.balanceOf(user));
        });
    });
});
