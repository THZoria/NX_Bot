class EventStructure {
    constructor({
        name = null,
        once = false,
        run = null
    }) {
        this.name = name;
        this.once = once;
        this.run = run;
    };
};

module.exports = EventStructure;
