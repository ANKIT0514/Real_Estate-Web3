const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/properties",  require("./routes/property.routes.cjs"));
app.use("/api/marketplace", require("./routes/marketplace.routes.cjs"));
app.use("/api/escrow",      require("./routes/escrow.routes.cjs"));
app.use("/api/rent",        require("./routes/rent.routes.cjs"));
app.use("/api/wallet",      require("./routes/wallet.routes.cjs"));

app.get("/", (req, res) =>
  res.json({ message: "🏠 Real Estate Blockchain API is running!" })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));