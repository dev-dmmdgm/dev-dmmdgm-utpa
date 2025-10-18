// import { createUser, indexUUIDs, verifyUser } from "./core";

// // const root = await createUser(Bun.env.ROOT_NAME!, Bun.env.ROOT_PASS!);
// const code = await verifyUser(Bun.env.ROOT_NAME!, Bun.env.ROOT_PASS!);
// console.log(code);
// console.log(indexUUIDs())

import * as core2 from "./core2";

// await core2.createUser("dmmdgm", "yuhhhh");
// await core2.renameUser("dmmdgm", "yuhhhh", "dmmdgm2");
// await core2.renameUser("dmmdgm2", "yuhhhh", "dmmdgm");
// await core2.repassUser("dmmdgm2", "yuhhhh", "yuhhhhh");
// await core2.repassUser("dmmdgm2", "yuhhhhh", "yuhhhh");
// await core2.deleteUser("dmmdgm", "yuhhhh");
// await core2.generateToken("dmmdgm", "yuhhhh");
const code = await core2.retrieveToken("dmmdgm", "yuhhhh");
// console.log(code);
// core2.allowPrivilege(code, "system-admin", "1", core2.sudo);
// core2.allowPrivilege(code, "system-admin", "1", code);
core2.denyPrivilege(code, "system-admin", core2.sudo);
// core2.denyPrivilege(code, "system-admin", code);