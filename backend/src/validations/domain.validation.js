import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const idParamValidation = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

export const membershipParamValidation = {
  params: Joi.object({
    id: objectId.required(),
    memberId: objectId.required(),
  }),
};

export const workerAssignmentParamValidation = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

export const queryFilterValidation = {
  query: Joi.object({
    search: Joi.string().trim().allow("").optional(),
    status: Joi.string().trim().optional(),
    projectId: objectId.optional(),
    workerId: objectId.optional(),
    taskId: objectId.optional(),
    assignedTo: objectId.optional(),
    skillType: Joi.string().trim().optional(),
    category: Joi.string().trim().optional(),
    lowStock: Joi.boolean().truthy("true").falsy("false").optional(),
    deliveryStatus: Joi.string().valid("ordered", "shipped", "delivered", "cancelled").optional(),
    costCategory: Joi.string().valid("Labor", "Material", "Equipment", "Overhead", "Other").optional(),
    paymentStatus: Joi.string().valid("Pending", "Paid", "Overdue", "Cancelled").optional(),
    role: Joi.string().valid("Admin", "Project_Manager", "Site_Engineer", "Storekeeper", "Worker").optional(),
    isActive: Joi.boolean().optional(),
    date: Joi.date().optional(),
    fromDate: Joi.date().optional(),
    toDate: Joi.date().optional(),
  }),
};

export const projectValidation = {
  body: Joi.object({
    projectName: Joi.string().trim().min(2).max(120).required(),
    siteLocation: Joi.string().trim().min(2).max(160).required(),
    projectType: Joi.string()
      .valid("Commercial", "Residential", "Infrastructure", "Industrial", "Other")
      .optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref("startDate")).required(),
    budget: Joi.number().min(0).required(),
    status: Joi.string()
      .valid("Planning", "Active", "On Hold", "Completed", "Cancelled")
      .optional(),
  }),
};

export const projectUpdateValidation = {
  body: projectValidation.body.fork(
    ["projectName", "siteLocation", "startDate", "endDate", "budget"],
    (schema) => schema.optional()
  ).min(1),
};

export const projectMemberValidation = {
  body: Joi.object({
    userId: objectId.required(),
    memberRole: Joi.string()
      .valid("Admin", "Project_Manager", "Site_Engineer", "Storekeeper", "Worker")
      .required(),
    fromDate: Joi.date().optional(),
    toDate: Joi.date().optional(),
  }),
};

export const taskValidation = {
  body: Joi.object({
    taskName: Joi.string().trim().min(2).max(140).required(),
    projectId: objectId.required(),
    assignedTo: objectId.allow(null, "").optional(),
    status: Joi.string().valid("Open", "In Progress", "Completed", "Blocked").optional(),
    priority: Joi.string().valid("Low", "Medium", "High", "Critical").optional(),
    dueDate: Joi.date().optional(),
    deadline: Joi.date().optional(),
    progress: Joi.number().min(0).max(100).optional(),
    dependencies: Joi.array().items(objectId).optional(),
    workersAssigned: Joi.array().items(objectId).optional(),
  }),
};

export const taskUpdateValidation = {
  body: taskValidation.body.fork(["taskName", "projectId"], (schema) => schema.optional()).min(1),
};

export const taskStatusValidation = {
  body: Joi.object({
    status: Joi.string().valid("Open", "In Progress", "Completed", "Blocked").required(),
  }),
};

export const taskProgressValidation = {
  body: Joi.object({
    progress: Joi.number().min(0).max(100).required(),
  }),
};

export const workerValidation = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    skillType: Joi.string()
      .valid("Mason", "Carpenter", "Electrician", "Plumber", "Laborer", "Painter", "Welder", "Other")
      .required(),
    contact: Joi.string().trim().allow("").max(20).optional(),
    rateType: Joi.string().valid("Daily", "Hourly").optional(),
    baseRate: Joi.number().min(0).required(),
    salary: Joi.number().min(0).optional(),
    userId: objectId.allow(null, "").optional(),
    projectIds: Joi.array().items(objectId).optional(),
  }),
};

export const workerUpdateValidation = {
  body: workerValidation.body.fork(["name", "skillType", "baseRate"], (schema) => schema.optional()).min(1),
};

export const inventoryValidation = {
  body: Joi.object({
    itemName: Joi.string().trim().min(2).max(120).required(),
    category: Joi.string().trim().min(2).max(80).required(),
    uom: Joi.string().trim().min(1).max(20).required(),
    unitCost: Joi.number().min(0).required(),
    minStockQty: Joi.number().min(0).optional(),
    currentStock: Joi.number().min(0).optional(),
    supplier: Joi.string().trim().allow("").max(120).optional(),
  }),
};

export const inventoryUpdateValidation = {
  body: inventoryValidation.body
    .fork(["itemName", "category", "uom", "unitCost"], (schema) => schema.optional())
    .min(1),
};

export const inventoryStockValidation = {
  body: Joi.object({
    quantity: Joi.number().positive().required(),
  }),
};

export const vendorValidation = {
  body: Joi.object({
    vendorName: Joi.string().trim().min(2).max(120).required(),
    contact: Joi.string().trim().allow("").max(20).optional(),
    email: Joi.string().email().allow("").optional(),
    address: Joi.string().trim().allow("").max(200).optional(),
    rating: Joi.number().min(0).max(5).optional(),
  }),
};

export const vendorUpdateValidation = {
  body: vendorValidation.body.fork(["vendorName"], (schema) => schema.optional()).min(1),
};

export const workerAssignmentValidation = {
  body: Joi.object({
    workerId: objectId.required(),
    taskId: objectId.required(),
    fromDate: Joi.date().required(),
    toDate: Joi.date().min(Joi.ref("fromDate")).required(),
  }),
};

export const userUpdateValidation = {
  params: Joi.object({
    id: objectId.required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(80).optional(),
    phone: Joi.string().trim().allow("").max(20).optional(),
    role: Joi.string().valid("Admin", "Project_Manager", "Site_Engineer", "Storekeeper", "Worker").optional(),
    isActive: Joi.boolean().optional(),
    verified: Joi.boolean().optional(),
  }).min(1),
};

export const attendanceValidation = {
  body: Joi.object({
    workerId: objectId.required(),
    projectId: objectId.required(),
    date: Joi.date().required(),
    status: Joi.string().valid("Present", "Half Day", "Absent").required(),
    hoursWorked: Joi.number().min(0).max(24).optional(),
  }),
};

export const procurementValidation = {
  body: Joi.object({
    projectId: objectId.required(),
    vendorId: objectId.required(),
    itemId: objectId.required(),
    quantity: Joi.number().positive().required(),
    unitPrice: Joi.number().min(0).required(),
    deliveryStatus: Joi.string().valid("ordered", "shipped", "delivered", "cancelled").optional(),
    expectedDelivery: Joi.date().optional(),
  }),
};

export const procurementStatusValidation = {
  body: Joi.object({
    deliveryStatus: Joi.string().valid("ordered", "shipped", "delivered", "cancelled").required(),
  }),
};

export const materialIssueValidation = {
  body: Joi.object({
    projectId: objectId.required(),
    taskId: objectId.allow(null, "").optional(),
    itemId: objectId.required(),
    quantity: Joi.number().positive().required(),
    remarks: Joi.string().trim().allow("").max(500).optional(),
  }),
};

export const financeMutationValidation = {
  body: Joi.object({
    projectId: objectId.required(),
    costCategory: Joi.string().valid("Labor", "Material", "Equipment", "Overhead", "Other").required(),
    date: Joi.date().optional(),
    amount: Joi.number().min(0).required(),
    description: Joi.string().trim().allow("").max(300).optional(),
    paymentStatus: Joi.string().valid("Pending", "Paid", "Overdue", "Cancelled").optional(),
    notes: Joi.string().trim().allow("").max(500).optional(),
  }),
};
