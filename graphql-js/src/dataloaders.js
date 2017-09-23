const DataLoader = require('dataloader');

// 1
async function batchUsers(Users, keys) {
    return await Users.find({ _id: { $in: keys } }).toArray();
}

// 2
module.exports = ({ Users }) => ({
    // 3
    userLoader: new DataLoader(
        keys => batchUsers(Users, keys),
        { cacheKeyFn: key => key.toString() },
    ),
});
