const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose();

const port = 10005
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Connect to SQLite database
const db = new sqlite3.Database("./database.sqlite");

// Initialize the database (in-memory for demonstration)
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS cci_state (id TEXT PRIMARY KEY, server_ip TEXT, server_status TEXT, mobile_status TEXT)");
});

// Get user by ID
app.get('/cci_state/:id', (req, res) => {
  const {id} = req.params;
  console.log(id)

  db.get("SELECT * FROM cci_state WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({error: err.message});
    }

    if (!row) {
      return res.status(404).json({error: "cci state not found"});
    }
    console.log(row)
    res.json(row);
  });
});

// Update user by ID
app.put('/cci_state/:id', (req, res) => {
  const {id} = req.params;
  const {server_ip, server_status, mobile_status} = req.body;

  db.get("SELECT * FROM cci_state WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({error: err.message});
    }

    if (!row) {
      db.run(
        "INSERT INTO cci_state (id, server_ip, server_status, mobile_status) VALUES (?, ?, ?, ?)",
        [id, server_ip, server_status, mobile_status],
        function (err) {
          if (err) {
            return res.status(500).json({error: err.message});
          }

          res.json({message: "cci state created successfully"});
        }
      );
      return
    }

    let update_params = {
      server_ip, server_status, mobile_status
    }
    Object.keys(update_params).forEach(k => {
      if (update_params[k] === undefined) {
        delete update_params[k]
      }
    })
    update_params = {...row, ...update_params}
    console.log(update_params)

    db.run(
      "UPDATE cci_state SET server_ip = ?, server_status = ?,mobile_status = ? WHERE id = ?",
      [update_params.server_ip, update_params.server_status, update_params.mobile_status,update_params.id],
      function (err) {
        if (err) {
          return res.status(500).json({error: err.message});
        }
        console.log(this)

        res.json({message: "cci state updated successfully"});
      }
    );
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
