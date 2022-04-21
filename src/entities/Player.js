import Phaser from 'phaser';
import initAnimations from './anims/playerAnims';
import collidable from '../mixins/collidable';
import HealthBar from '../hud/HealthBar';
import Projectiles from '../attacks/Projectiles';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    
    //adding the sprite(player imge and all) 
    scene.add.existing(this);

    //adding the functionalities of the player
    scene.physics.add.existing(this);

     // Mixins
     Object.assign(this, collidable);
        
    this.init();
    this.initEvents();
    }

    init() {
    this.gravity = 500;
     //left and right speed
     this.playerSpeed=150;
     //taking instru. form the user

    this.jumpCount = 0;
    this.consecutiveJumps = 1;

    this.hasBeenHit = false;
    this.bounceVelocity = 250;

    this.cursors= this.scene.input.keyboard.createCursorKeys();
    this.projectiles = new Projectiles(this.scene);

    this.health = 100;
    this.hp = new HealthBar(
      this.scene,
      this.scene.config.leftTopCorner.x + 5,
      this.scene.config.leftTopCorner.y + 5,
      2,
      this.health
    )

    this.body.setSize(20, 36);
    this.body.setGravityY(this.gravity);
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);

    initAnimations(this.scene.anims);

    // for firing iceballs 
    this.scene.input.keyboard.on('keydown-Q', () => {
      console.log('pressing Q');
      this.projectiles.fireProjectile(this);
    })
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
      }
    
      
      update() {
        if (this.hasBeenHit) { return; }
        const { left, right, space, up } = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);
        const onFloor = this.body.onFloor();

    if (left.isDown) {
        this.setVelocityX(-this.playerSpeed);
        //when we go left the player should face left side
        this.setFlipX(true);
    } else if (right.isDown) {
        this.setVelocityX(this.playerSpeed);
        this.setFlipX(false);
    } else {
        this.setVelocityX(0);
    }

    if ((isSpaceJustDown || isUpJustDown) && (onFloor || this.jumpCount < this.consecutiveJumps)) {
      this.setVelocityY(-this.playerSpeed * 2)
      this.jumpCount++;
    }

    if (onFloor) {
      this.jumpCount = 0;
    }

    //if player in on the floor then
    onFloor ?
    //if we are standing then play IDLE animation
    //if we move play RUN animation
    this.body.velocity.x !== 0 ?
    this.play('run', true) : this.play('idle', true):
    
    //play the jump animation
    this.play('jump', true)
  }

  playDamageTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      repeat: -1,
      tint: 0xffffff
    })
  }

  bounceOff() {
    this.body.touching.right ?
    this.setVelocityX(-this.bounceVelocity) :
    this.setVelocityX(this.bounceVelocity);

  setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
  }

  takesHit(initiator) {
    if (this.hasBeenHit) { return; }
    this.hasBeenHit = true;
    this.bounceOff();
    const hitAnim = this.playDamageTween();

    this.health -= initiator.damage;
    this.hp.decrease(this.health);
    
    this.scene.time.delayedCall(1000, () => {
      this.hasBeenHit = false;
      hitAnim.stop();
      this.clearTint();
    })
    
      }
}


export default Player;