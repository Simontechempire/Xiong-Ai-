// 👑 OWNER CONTROL - XIONG AI / SIMON TECH INC
// File: Ownercontrol.js
// Founder: Simon (Delta State, Lagos Base)
// Created: 31 Oct 2026

module.exports = {
  // ===== OWNER GROUP =====
  ownerGroup: {
    owners: [
      "234XXXXXXXXXX@s.whatsapp.net", // Simon - Main Owner
    ],
    ownerGroupId: "1203630XXXXXXXX@g.us",
    ownerGroupName: "XIONG AI OWNERS"
  },

  // ===== 20 OWNER CONTROLS =====
  controls: {
    // 1. Send Image Control
    sendImage: true,

    // 2. Code Exploits Control
    codeExploits: false,

    // 3. Send Video Control
    sendVideo: true,

    // 4. Send Voice Note Control
    sendVoiceNote: true,

    // 5. Send Document Control
    sendDocument: true,

    // 6. Owner Only Mode
    ownerOnlyMode: false,

    // 7. Anti Ban Control
    antiBan: true,

    // 8. Allow Bot Restart
    allowRestart: true,

    // 9. Allow Bot Shutdown
    allowShutdown: true,

    // 10. Allow Broadcast
    allowBroadcast: true,

    // 11. Group Control
    allowGroupControl: true,

    // 12. Allow Add Owner
    allowAddOwner: true,

    // 13. Remove Owner
    allowRemoveOwner: true,

    // 14. Block User
    allowBlockUser: true,

    // 15. Unblock User
    allowUnblockUser: true,

    // 16. Eval Code
    allowEval: false,

    // 17. Shell Exec
    allowShellExec: false,

    // 18. Settings Change
    allowSettingsChange: true,

    // 19. Delete Chats
    allowDeleteChat: true,

    // 20. Create Animation
    allowCreateAnimation: true
  },
   // 20. code bypasser
    allowCodebypasser: true
  },


  isOwner: function(sender) {
    return this.ownerGroup.owners.includes(sender);
  },
  checkControl: function(controlName) {
    return this.controls[controlName] === true;
  }
};
