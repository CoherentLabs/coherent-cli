module.exports = `
engine.on("Ready", () => {
    <% for (let i = 0; i < models.length; i++) {%>
    engine.createJSModel("<%= models[i] %>", {});
    <% } %>
    engine.synchronizeModels();
});
`;
