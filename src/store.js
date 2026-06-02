const fs = require('node:fs/promises');
const path = require('node:path');

class SalesStore {
  constructor(filePath = path.join(process.cwd(), 'data', 'sales.json')) {
    this.filePath = filePath;
    this.sales = [];
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      this.sales = JSON.parse(raw);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      this.sales = [];
    }
    this.loaded = true;
  }

  async list() {
    await this.load();
    return [...this.sales].sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt));
  }

  async upsert(sale) {
    await this.load();
    const index = this.sales.findIndex((existing) => existing.id === sale.id);
    if (index >= 0) this.sales[index] = sale;
    else this.sales.push(sale);
    await this.save();
    return sale;
  }

  async save() {
    await fs.writeFile(this.filePath, `${JSON.stringify(this.sales, null, 2)}\n`);
  }
}

module.exports = { SalesStore };
