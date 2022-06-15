module.exports = `
engine.on("Ready", () => {
    engine.createJSModel("<%= model %>", {});
    engine.synchronizeModels();
});
`;
