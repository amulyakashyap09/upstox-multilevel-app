module.exports = {
    name: "CustomerPlugin",
    register: async (server, options) => {
        server.route(require("./routes"));
    }
}