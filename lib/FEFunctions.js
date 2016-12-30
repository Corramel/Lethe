var exports = {};
exports.playerSkillTriggers = function(player1obj, player1skillobjs, turnType) { //skills
    var player1sklkeys = Object.keys(player1skillobjs);
    var skilltriggered = false;
    if (turnType == "attack") { // Activates during attack
        var skillsArray = [];
        for (i = 0; i < player1sklkeys.length; i++) {

            if (player1skillobjs[player1sklkeys[i]].turnType == "attack") {
                skillsArray.push(player1sklkeys[i]);
            }
        }
        while (!skilltriggered) {
            for (i = 0; i < skillsArray.length; i++) {
                ////console.log(skillsArray.length);
                ////console.log(player1skillobjs);
                ////console.log(skillsArray);
                if (player1skillobjs[skillsArray[i]].chanceType == "skl") {
                    if (Math.random() <= (player1obj.skl * player1skillobjs[skillsArray[i]].chanceMultiplier) / 100) {
                        skilltriggered = true;
                        return player1skillobjs[skillsArray[i]];
                        break;
                    }
                } else if (player1skillsobj[skillsArray[i]].chanceType == "lck") {
                    if (Math.random() <= (player1obj.lck * player1skillobjs[skillsArray[i]].chanceMultiplier) / 100) {
                        skilltriggered = true;
                        return player1skillobjs[skillsArray[i]];
                        break;
                    }
                }
            }
            skilltriggered = true;
        }
    } else if (turnType == "defend") {
        // Activates during Defense
        var skillsArray = [];
        for (i = 0; i < player1sklkeys.length; i++) {

            if (player1skillobjs[player1sklkeys[i]].turnType == "defend") {
                skillsArray.push(player1sklkeys[i]);
                ////console.log(player1skillobjs[player1sklkeys[i]]);
            }
        }
        while (!skilltriggered) {
            for (i = 0; i < skillsArray.length; i++) {
                ////console.log(player1skillobjs);
                ////console.log(skillsArray);
                if (player1skillobjs[skillsArray[i]].chanceType == "skl") {
                    if (Math.random() <= (player1obj.skl * player1skillobjs[skillsArray[i]].chanceMultiplier) / 100) {
                        skilltriggered = true;
                        return player1skillobjs[skillsArray[i]];
                        break;
                    }
                } else if (player1skillobjs[skillsArray[i]].chanceType == "lck") {
                    if (Math.random() <= (player1obj.lck * player1skillobjs[skillsArray[i]].chanceMultiplier) / 100) {
                        skilltriggered = true;
                        return player1skillobjs[skillsArray[i]];
                        break;
                    }
                }
            }
            skilltriggered = true;
        }
    } else if (turnType == "start") {
        // Activates @ start of turn
        var skillsArray = [];
        for (i = 0; i < player1sklkeys.length; i++) {

            if (player1skillobjs[player1sklkeys[i]].turnType == "start") {
                skillsArray.push(player1sklkeys[i]);
                //console.log(player1skillobjs[player1sklkeys[i]]);
            }
        }
        while (!skilltriggered) {
            for (i = 0; i < skillsArray.length; i++) {
                ////console.log(player1skillobjs);
                //  //console.log(skillsArray);
                if (player1skillobjs[skillsArray[i]].chanceType == "skl") {
                    if (Math.random() <= (player1obj.skl * player1skillobjs[skillsArray[i]].chanceMultiplier) / 100) {
                        skilltriggered = true;
                        return player1skillobjs[skillsArray[i]];
                        break;
                    }
                } else if (player1skillsobj[skillsArray[i]].chanceType == "lck") {
                    if (Math.random() <= (player1obj.lck * player1skillobjs[skillsArray[i]].chanceMultiplier) / 100) {
                        skilltriggered = true;
                        return player1skillobjs[skillsArray[i]];
                        break;
                    }
                }
            }
            skilltriggered = true;
        }
    } else {
        return;
    }
}

exports.calculateCritChance = function(playerobj, enemyobj) {
    var critChance = ((playerobj.skl / 2 + 5) / 100) - enemyobj.lck;
    if (Math.random() <= critChance) {
        return true;
    } else {
        return false;
    }
}

exports.calculateDmgRaw = function(playerobj, weaponobj) {
    return playerobj.str + weaponobj.damage;
}

exports.calculateDmgMods = function(player1raw, player2def) {
    return player1raw - player2def;
}

exports.calculateDoubleAtk = function(player1spd, player2spd) {
    if (player1spd > player2spd + 4) {
        return true;
    } else {
        return false;
    }
}
exports.calculateDodge = function(attackerObj, attackerWep, defObj) {
  //console.log((((attackerObj.skl * 1.5) + (attackerObj.lck * 0.5) / 100) + attackerWep.hit - ((defObj.spd * 1.5) + (defObj.lck * 0.5) / 100)))
    if (Math.random() >= (((attackerObj.skl * 1.5) + (attackerObj.lck * 0.5) / 100) + attackerWep.hit - ((defObj.spd * 1.5) + (defObj.lck * 0.5))/100)) {
        return true;
    } else {
        return false;
    }
}

exports.player1Attack = function(player1obj, p1wep, player1name, player2obj, p2wep, player2name) {
    var playerAttacklog = [];
    var playerDamagelog = [];
    var playerBattlelog = [];
    var calculatedSkillMod = false;
    var battlelog = "";
    var p1DmgBeforeMods = exports.calculateDmgRaw(player1obj, p1wep);
    var activatedSkillp1 = exports.playerSkillTriggers(player1obj, player1obj.skills, "attack");
    var p1DmgAfterMods = [];
    for (var i = 0; i < 1; i++) {
        //console.log("Running for loop " + (i + 1) + " many times.")
        if (activatedSkillp1) {
            if (activatedSkillp1.damageMultiplier > 0.9) {
                p1DmgBeforeMods = p1DmgBeforeMods * activatedSkillp1.damageMultiplier;
            } else {
                p1DmgBeforeMods = exports.calculateDmgMods(p1DmgBeforeMods, player2obj.def)
                calculatedSkillMod = true;
            }
            battlelog = battlelog + player1name + " activated " + activatedSkillp1.name + "! ";
            //console.log(battlelog);
            playerBattlelog.push(battlelog);
            battlelog = "";
            for (n = 0; n < activatedSkillp1.multihit; n++) {
                if (!calculatedSkillMod) {
                    //console.log("Didn't calculate the skill mod");
                    if ((p1DmgBeforeMods - player2obj.def) > 0) {
                        if(activatedSkillp1.effect == "reddef"){
                          p1DmgAfterMods.push(p1DmgBeforeMods - (player2obj.def * activatedSkillp1.defAtkMod));
                        } else{
                        p1DmgAfterMods.push(p1DmgBeforeMods - player2obj.def);
                      }
                    } else {
                        p1DmgAfterMods.push(0);
                    }
                } else if (calculatedSkillMod) {
                    //console.log("Calculated the skill mod");
                    if (p1DmgBeforeMods > 0) {
                        p1DmgAfterMods.push(Math.floor(p1DmgBeforeMods * activatedSkillp1.damageMultiplier));
                    } else {
                        p1DmgAfterMods.push(0);
                    }
                }
                if (exports.calculateCritChance(player1obj, player2obj)) {
                    //calculate crit
                    p1DmgAfterMods[i] = p1DmgAfterMods[i] * 3;
                    battlelog = battlelog + player1name + " got a critical hit!";
                    playerBattlelog.push(battlelog);
                    battlelog = "";
                }
                //p1DmgAfterMods = 0;
            }
            playerAttacklog.push(playerBattlelog, p1DmgAfterMods);
            p1DmgBeforeMods = exports.calculateDmgRaw(player1obj, p1wep);
            battlelog = "";
            p1DmgAfterMods = [];
            playerBattlelog = [];
        } else {
            if ((p1DmgBeforeMods - player2obj.def) > 0) {
                p1DmgAfterMods.push(p1DmgBeforeMods - player2obj.def);
                p1DmgBeforeMods = exports.calculateDmgRaw(player1obj, p1wep);
                battlelog = "";
            } else {
                p1DmgAfterMods.push(0);
                battlelog = player1name + " did 0 damage!"
                playerBattlelog.push(battlelog);
                p1DmgBeforeMods = exports.calculateDmgRaw(player1obj, p1wep);
                battlelog = "";
            }

            playerAttacklog.push(playerBattlelog, p1DmgAfterMods);
            p1DmgAfterMods = [];
            playerBattlelog = [];
        }
        activatedSkillp1 = exports.playerSkillTriggers(player1obj, player1obj.skills, "attack")
        calculatedSkillMod = false;
        battlelog = ""
    }
    //console.log(playerAttacklog);
    return playerAttacklog;
}

//Make it so that the defend turn takes the damage from the player's turn.
exports.enemyDefense = function(attackerObj, attackerWep, player1AttackLog, player1name, attackerHP, player2obj, player2name, player2currentHP) {
  ////console.log("Start!");
    var playerAttacklog = [];
    var prettyLog = [];
    var fallen = false;
    var calculatedSkillMod = false;
    var battlelog = "";
    var activatedSkilldef = exports.playerSkillTriggers(player2obj, player2obj.skills, "defend");
    var defendActivatedSkill = false;
    var defenderHPAfterMods = [];
    var defenderHP = player2obj.hp;
    var currentHP = player2currentHP;
    var atkCurrentHP = attackerHP;
    var lengthOfAttack = player1AttackLog[1].length;
    for (var i = 0; i < lengthOfAttack; i++) {
      //console.log(i);
      if(exports.calculateDodge(attackerObj, attackerWep, player2obj)){
        battlelog = battlelog + player2name + " dodged " + player1name + "'s attack! " + player2name + " has " + currentHP + " HP left. \n";
        playerAttacklog.push(battlelog, currentHP, fallen, atkCurrentHP);
        //console.log("Finished loop, dodge!");
        var activatedSkilldef = exports.playerSkillTriggers(player2obj, player2obj.skills, "defend");
      } else {
        if (activatedSkilldef) {
          //console.log("Skills activated!");
            if ((player1AttackLog[0][0] !== undefined) && (player1AttackLog[0][0] !== "")) {
              //console.log("Attacklog is not undefined.");
                battlelog = battlelog + player1AttackLog[0][0] + player2name + " activated " + activatedSkilldef.name + "! "  + player1name + " did " + Math.floor((player1AttackLog[1][i] * activatedSkilldef.dmgRed)) + " damage! ";
                ////console.log(battlelog);
                if(player1AttackLog[0][0].indexOf("Sol") > -1){
                  //console.log("Sol was activated");
                  if(!(atkCurrentHP > attackerObj.hp-1)){
                    battlelog = battlelog + player1name + " healed for " + (Math.floor((player1AttackLog[1][i]) * activatedSkilldef.dmgRed)) + " hp! ";
                    atkCurrentHP = atkCurrentHP + (Math.floor((player1AttackLog[1][i]) * activatedSkilldef.dmgRed));
                  }
                  defenderHPAfterMods.push(currentHP - (Math.floor((player1AttackLog[1][i]) * activatedSkilldef.dmgRed)));
                  currentHP = currentHP - (Math.floor((player1AttackLog[1][i]) * activatedSkilldef.dmgRed));
                } else {
                defenderHPAfterMods.push(currentHP - (Math.floor((player1AttackLog[1][i]) * activatedSkilldef.dmgRed)));
                currentHP = currentHP - (Math.floor(player1AttackLog[1][i]) * activatedSkilldef.dmgRed);
              }
                if (currentHP > 0) {
                    battlelog = battlelog + player2name + " has " + currentHP + " hp remaining.\n \n";
                    fallen = false;
                } else {
                    battlelog = battlelog + player2name + " has fallen.\n \n";
                    fallen = true;
                    playerAttacklog.push(battlelog, currentHP, fallen, atkCurrentHP);
                    return playerAttacklog;
                    break;

                }
            } else {
              //console.log("Attacklog is undefined");
                battlelog = battlelog + player2name + " activated " + activatedSkilldef.name + "! " + player1name + " did " + Math.floor((player1AttackLog[1][i] * activatedSkilldef.dmgRed)) + " damage! ";
                currentHP = currentHP - Math.floor((player1AttackLog[1][i]) * activatedSkilldef.dmgRed);
                if (currentHP > 0) {
                    battlelog = battlelog + player2name + " has " + currentHP + " hp remaining.\n \n";
                    fallen = false;
                } else {
                    battlelog = battlelog + player2name + " has fallen.\n \n";
                    fallen = true;
                    playerAttacklog.push(battlelog, currentHP, fallen, atkCurrentHP);
                    return playerAttacklog;
                    break;

                }

            }

        } else {
          //console.log("No skill activated");
            if ((player1AttackLog[0][0] !== undefined) && (player1AttackLog[0][0] !== "")) {
              //console.log("Attacklog isn't undefined, no skill");
                battlelog = battlelog + player1AttackLog[0][0] + player1name + " did " + Math.floor(player1AttackLog[1][i]) + " damage! ";
                    if(player1AttackLog[0][0].indexOf("Sol") > -1){
                      //console.log("Sol was activated");
                      if(!(atkCurrentHP > attackerObj.hp-1)){
                        battlelog = battlelog + player1name + " healed for " + Math.floor(player1AttackLog[1][i]) + " hp! ";
                        atkCurrentHP = atkCurrentHP + (Math.floor(player1AttackLog[1][i]));
                      }
                      defenderHPAfterMods.push(currentHP - (Math.floor(player1AttackLog[1][i])));
                      currentHP = currentHP - (Math.floor(player1AttackLog[1][i]));
                    } else {
                ////console.log(battlelog);
                defenderHPAfterMods.push(Math.floor(currentHP - player1AttackLog[1][i]));
                currentHP = currentHP - Math.floor((player1AttackLog[1][i]));
              }
                if (currentHP > 0) {
                    battlelog = battlelog + player2name + " has " + currentHP + " hp remaining.\n \n";
                    fallen = false;
                } else {
                    battlelog = battlelog + player2name + " has fallen.\n \n";
                    fallen = true;
                    playerAttacklog.push(battlelog, currentHP, fallen, atkCurrentHP);
                    return playerAttacklog;
                    break;
                }
            } else {
              //console.log("Attacklog is undefined, no skill");
                battlelog = battlelog + player1name + " did " + Math.floor(player1AttackLog[1][i]) + " damage! ";
                currentHP = currentHP - ((player1AttackLog[1][i]));
                if (currentHP > 0) {
                    battlelog = battlelog + player2name + " has " + currentHP + " hp remaining.\n \n";
                    fallen = false;
                } else {
                    battlelog = battlelog + player2name + " has fallen.\n \n";
                    fallen = true;
                    playerAttacklog.push(battlelog, currentHP, fallen, atkCurrentHP);
                    return playerAttacklog;
                    break;

                }

            }
        }
        playerAttacklog.push(battlelog, currentHP, fallen, atkCurrentHP);
        //console.log("Finished loop!");
        var activatedSkilldef = exports.playerSkillTriggers(player2obj, player2obj.skills, "defend");
      }
    }
    prettyLog = [playerAttacklog[playerAttacklog.length-4], playerAttacklog[playerAttacklog.length-3], playerAttacklog[playerAttacklog.length-2], playerAttacklog[playerAttacklog.length-1]];
    return prettyLog;

}

exports.formatBattleLog = function(p1TurnLogs, p2TurnLogs) {

}

function player2Turn(p2AttackLog, p2DefendLog) {

}
module.exports = exports;
