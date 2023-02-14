interface Name {
  original: string;
  value: string;
  namespace: string;
}

export default class EventEmitter {
  callbacks: Map<string, Map<string, any[]>>;

  constructor() {
    this.callbacks = new Map();
    this.callbacks.set("base", new Map());
  }

  on(_names: string, callback: Function) {
    if (!_names) {
      console.warn("wrong names");
      return false;
    }

    if (!callback) {
      console.warn("wrong callback");
      return false;
    }

    const names = this.resolveNames(_names);

    names.forEach((_name) => {
      const name = this.resolveName(_name);

      const namespaceMap = this.callbacks.has(name.namespace)
        ? this.callbacks.get(name.namespace)
        : this.callbacks.set(name.namespace, new Map()).get(name.namespace);

      // Create callback array if not exist
      if (!namespaceMap?.has(name.value)) {
        namespaceMap?.set(name.value, []);
      }

      // Add callback
      namespaceMap?.get(name.value)?.push(callback);
    });

    return this;
  }

  off(_names: string) {
    if (!_names) {
      console.warn("wrong name");
      return false;
    }

    // Resolve names
    const names = this.resolveNames(_names);

    // Each name
    names.forEach((_name) => {
      // Resolve name
      const name = this.resolveName(_name);

      // Remove namespace
      if (name.namespace !== "base" && name.value === "") {
        this.callbacks.delete(name.namespace);
      }

      // Remove specific callback in namespace
      else {
        // Default
        if (name.namespace === "base") {
          // Try to remove from each namespace
          for (const namespace in this.callbacks) {
            if (this.callbacks.has(namespace) && this.callbacks.get(namespace)?.has(name.value)) {
              this.callbacks.get(namespace)?.delete(name.value);

              // Remove namespace if empty
              if (this.callbacks.get(namespace)?.keys.length === 0) {
                this.callbacks.delete(namespace);
              }
            }
          }
        }

        // Specified namespace
        else if (
          this.callbacks.has(name.namespace) &&
          this.callbacks.get(name.namespace)?.has(name.value)
        ) {
          this.callbacks.get(name.namespace)?.delete(name.value);

          // Remove namespace if empty
          if (this.callbacks.get(name.namespace)?.keys.length === 0) {
            this.callbacks.delete(name.namespace);
          }
        }
      }
    });

    return this;
  }

  trigger(_name: string, _args?: any[]) {
    if (!_name) {
      console.warn("wrong name");
      return false;
    }

    let finalResult: any = null;
    let result = null;

    // Default args
    const args = !(_args instanceof Array) ? [] : _args;

    // Resolve names (should on have one event)
    const nameArray = this.resolveNames(_name);

    // Resolve name
    const name = this.resolveName(nameArray[0]);

    // Default namespace
    if (name.namespace === "base") {
      // Try to find callback in each namespace
      this.callbacks.forEach((namespace) => {
        if (namespace.has(name.value)) {
          namespace.get(name.value)?.forEach((cb) => {
            result = cb.apply(this, args);

            if (typeof finalResult === "undefined") {
              finalResult = result;
            }
          });
        }
      });
    }

    // Specified namespace
    else if (this.callbacks.has(name.namespace)) {
      if (name.value === "") {
        console.warn("wrong name");
        return this;
      }

      this.callbacks
        .get(name.namespace)
        ?.get(name.value)
        ?.forEach((cb) => {
          result = cb.apply(this, args);

          if (typeof finalResult === "undefined") {
            finalResult = result;
          }
        });
    }

    return finalResult;
  }

  resolveNames(_names: string) {
    return _names
      .replace(/[^a-zA-Z0-9 ,/.]/g, "")
      .replace(/[,/]+/g, " ")
      .split(" ");
  }

  resolveName(name: string) {
    const newName: Partial<Name> = {};
    const parts = name.split(".");

    newName.original = name;
    newName.value = parts[0];
    newName.namespace = "base"; // Base namespace

    // Specified namespace
    if (parts.length > 1 && parts[1] !== "") {
      newName.namespace = parts[1];
    }

    return newName as Name;
  }
}
