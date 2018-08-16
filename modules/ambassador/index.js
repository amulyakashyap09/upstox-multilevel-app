module.exports = {
    name: "AmbassadorPlugin",
    register: async (server, options) => {
        server.route(require("./routes"));
    }
}