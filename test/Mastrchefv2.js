const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Masterchef test cases ', async () => {
  let masterchef;
  let signer;
  let cakeToken;
  let syrupbar;
  let lpToken1;
  let lpToken2;

  async function _deposit() {
    await masterchef.add(100, lpToken1.target, true);
    await lpToken1.connect(signer[0]).approve(masterchef.target, 1000);
    await masterchef.connect(signer[0]).deposit(1, 500);
  }
  async function _beforeStaking() {
    await _deposit();
    await masterchef.connect(signer[0]).withdraw(1, 500);
  }
  beforeEach(async () => {
    signer = await ethers.getSigners();

    const CakeTokenContract = await ethers.getContractFactory('CakeToken');
    cakeToken = await CakeTokenContract.connect(signer[0]).deploy();

    const SyrupBarContract = await ethers.getContractFactory('SyrupBar');
    syrupbar = await SyrupBarContract.connect(signer[0]).deploy(
      cakeToken.target
    );

    const MasterChefv2 = await ethers.getContractFactory('MasterChef');
    masterchef = await MasterChefv2.connect(signer[0]).deploy(
      cakeToken.target,
      syrupbar.target,
      signer[1].address,
      1000,
      10
    );

    const LpToken1 = await ethers.getContractFactory('MockBEP20');

    lpToken1 = await LpToken1.connect(signer[0]).deploy(
      'LP',
      'LPToken',
      ethers.parseEther('100000')
    );
    lpToken2 = await LpToken1.connect(signer[0]).deploy(
      'LP2',
      'LPToken2',
      ethers.parseEther('100000')
    );

    await cakeToken.transferOwnership(masterchef.target);
    await syrupbar.transferOwnership(masterchef.target);
  });
  it('Print addresses of contract', async () => {
    console.log('Signer Address: - ', await signer[0].address);
    console.log('Cake Token Address: - ', await cakeToken.target);
    console.log('SyrunBar Token address: - ', await syrupbar.target);
    console.log('Masterchef Address: - ', await masterchef.target);
    console.log('Lptoken Address: - ', await lpToken1.target);
  });
  it('Masterchef v2 add funciton', async () => {
    console.log('Add function..');

    await masterchef.add(100, lpToken1.target, true);
    console.log('Pool Lenght: ', await masterchef.poolLength());

    await masterchef.add(200, lpToken2.target, true);
    console.log('pool length ', await masterchef.poolLength());

    expect(await masterchef.poolLength()).to.be.equal(3n);
  });
  describe('Deposit fuction Testing', async () => {
    it('Deposit Function : ', async () => {
      console.log('Deposit function');
      console.log('BEFORE DEPOSIT');
      await masterchef.add(1000, lpToken1.target, true);
      initalSignerBalance = await lpToken1.balanceOf(signer[0].address);
      initalMasterShef = await lpToken1.balanceOf(masterchef.target);
      cakeBalanceinitial = await cakeToken.balanceOf(signer[0].address);
      console.log('lp token balance of Signer: ', initalSignerBalance);
      console.log('lp token balance of Master chef: ', initalMasterShef);
      console.log('Cake Token balance Initial: - ', cakeBalanceinitial);

      await lpToken1.connect(signer[0]).approve(masterchef.target, 900);
      await masterchef.connect(signer[0]).deposit(1, 200);
      // await masterchef.connect(signer[0]).deposit(1, 200);
      // console.log(await lpToken1.name());
      console.log('AFTER DEPOSIT');

      finalSigner = await lpToken1.balanceOf(signer[0].address);
      finalmasterShef = await lpToken1.balanceOf(masterchef.target);
      cakeBalanceFinal = await cakeToken.balanceOf(signer[0].address);
      console.log('Lp token balance of signer: - ', finalSigner);
      console.log('Lp token at masterchef: - ', finalmasterShef);
      console.log('Cake Token balance Final : - ', cakeBalanceFinal);

      expect(initalSignerBalance).to.be.greaterThan(finalSigner);
      expect(finalmasterShef).to.be.greaterThan(initalMasterShef);
      expect(finalmasterShef).to.be.equal(200);
    });
    it('Deposit with Error', async () => {
      await masterchef.add(1000, lpToken1.target, true);

      await lpToken1.connect(signer[0]).approve(masterchef.target, 900);
      await expect(
        masterchef.connect(signer[0]).deposit(0, 200)
      ).to.be.revertedWith('deposit CAKE by staking');
    });
  });
  describe('Withdraw Function Testing', async () => {
    it('Withdraw Function : - ', async () => {
      console.log('IN Withdraw Funciton');
      await masterchef.add(100, lpToken1.target, true);
      await lpToken1.connect(signer[0]).approve(masterchef.target, 1000);
      await masterchef.connect(signer[0]).deposit(1, 300);

      console.log('AFTER DEPOSIT');

      initalCake = await cakeToken.balanceOf(signer[0].address);
      initialLpBalance = await lpToken1.balanceOf(signer[0].address);
      initalMasterchef = await lpToken1.balanceOf(masterchef.target);

      console.log('Initial Balance of Cake Token: - ', initalCake);
      console.log('Initial Balance of Lp Token: - ', initialLpBalance);
      console.log('Initial Balance of Masterchef Token: - ', initalMasterchef);

      await masterchef.connect(signer[0]).withdraw(1, 250);

      finalCakeafterDeposit = await cakeToken.balanceOf(signer[0].address);
      FinalLpBalance = await lpToken1.balanceOf(signer[0].address);
      finalMasterchef = await lpToken1.balanceOf(masterchef.target);

      console.log('Final Balance of Cake Token: - ', finalCakeafterDeposit);
      console.log('Final Balance of Lp Token: - ', FinalLpBalance);
      console.log('Final Balance of Masterchef Token: - ', finalMasterchef);

      expect(finalCakeafterDeposit).to.be.greaterThan(initalCake);
      expect(FinalLpBalance).to.be.greaterThan(initialLpBalance);

      expect(initalMasterchef).to.be.greaterThan(finalMasterchef);
    });
    it('withdraw function fior error 1 check : ', async () => {
      await _deposit();

      await expect(
        masterchef.connect(signer[0]).withdraw(0, 100)
      ).to.be.revertedWith('withdraw CAKE by unstaking');
    });
    it('Withdraw Function for Error 2 check: - ', async () => {
      await _deposit();

      await expect(
        masterchef.connect(signer[0]).withdraw(1, 501)
      ).to.be.revertedWith('withdraw: not good');
    });
  });
  describe('EnterStaking Function and LeaveStaking function Testing', async () => {
    it('Enter staking: - ', async () => {
      //   await _deposit();
      await _beforeStaking();

      console.log('BEFORE ENTERSTAKING');
      initialCake = await cakeToken.balanceOf(signer[0].address);
      initialmasterchef = await lpToken1.balanceOf(masterchef.target);
      initalSyrup = await syrupbar.balanceOf(signer[0].address);
      console.log('Cake Balance of Signer: - ', initialCake);
      console.log('Syrup Balance of Signer: - ', initalSyrup);
      console.log('Initial balance of Mastechef: - ', initialmasterchef);

      await cakeToken.connect(signer[0]).approve(masterchef.target, 1000);
      console.log('adsfasdf');
      await masterchef.connect(signer[0]).enterStaking(500);

      console.log('AFTER ENTERSTAKING');
      finalcakebalance = await cakeToken.balanceOf(signer[0].address);
      finalSyrupbalance = await syrupbar.balanceOf(signer[0].address);
      console.log('Cake Balance of Signer : ', finalcakebalance);
      console.log('Syrup Balance of Signer : ', finalSyrupbalance);

      expect(initialCake).to.be.greaterThan(finalcakebalance);
      expect(finalSyrupbalance).to.be.greaterThan(initalSyrup);
    });
    it('LeaveStaking Function : ', async () => {
      await _beforeStaking();

      await cakeToken.connect(signer[0]).approve(masterchef.target, 1000);
      await masterchef.connect(signer[0]).enterStaking(500);

      initialCake = await cakeToken.balanceOf(signer[0].address);
      initialmasterchef = await lpToken1.balanceOf(masterchef.target);
      initalSyrup = await syrupbar.balanceOf(signer[0].address);
      console.log('Cake Balance of Signer: - ', initialCake);
      console.log('Syrup Balance of Signer: - ', initalSyrup);
      console.log('Initial balance of Mastechef: - ', initialmasterchef);

      await masterchef.connect(signer[0]).leaveStaking(500);

      console.log('AFTER LeaveSTAKING');
      finalcakebalance = await cakeToken.balanceOf(signer[0].address);
      finalSyrupbalance = await syrupbar.balanceOf(signer[0].address);
      console.log('Cake Balance of Signer : ', finalcakebalance);
      console.log('Syrup Balance of Signer : ', finalSyrupbalance);

      expect(finalcakebalance).to.be.greaterThan(initialCake);
      expect(initalSyrup).to.be.greaterThan(finalSyrupbalance);
    });
  });
  it('EMERGENCY WITHDRAW FUNCITON : ', async () => {
    await _deposit();

    initialCake = await cakeToken.balanceOf(signer[0].address);
    initialmasterchef = await lpToken1.balanceOf(masterchef.target);
    initalSyrup = await syrupbar.balanceOf(signer[0].address);
    console.log('Cake Balance of Signer: - ', initialCake);
    console.log('Syrup Balance of Signer: - ', initalSyrup);
    console.log('Initial balance of Mastechef: - ', initialmasterchef);

    await masterchef.connect(signer[0]).emergencyWithdraw(1);

    console.log('AFTER LeaveSTAKING');
    finalcakebalance = await cakeToken.balanceOf(signer[0].address);
    finalSyrupbalance = await syrupbar.balanceOf(signer[0].address);
    console.log('Cake Balance of Signer : ', finalcakebalance);
    console.log('Syrup Balance of Signer : ', finalSyrupbalance);
  });
  it('Dev Functon : ', async () => {
    console.log(
      'Dev address befor Dev Function called: - ',
      await masterchef.devaddr()
    );
    await masterchef.connect(signer[1]).dev(signer[2].address);
    console.log(
      'Dev address after Dev Function called: - ',
      await masterchef.devaddr()
    );
  });
  it('Dev function with ERROR! check', async () => {
    await expect(
      masterchef.connect(signer[0]).dev(signer[2].address)
    ).to.be.revertedWith('dev: wut?');
    console.log(await masterchef.devaddr());
  });
});
