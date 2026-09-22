const permissionService = require("../services/permissionsService")
const { tryCatch } = require("../utils/tryCatch");

const findById = tryCatch(async (req, res) => {
  const permissions = await permissionService.getPermissionsByUser(req.params.id)
  return res.status(200).json({elements: permissions });
});

module.exports = {findById}