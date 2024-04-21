const readline = require("readline");
const fs = require("fs");
var colors = require("colors");

const directoryPath = "./files";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function displayAppTitle() {
  console.log(colors.inverse.red("Administrador de archivos"));
}

function displayTitle(text) {
  console.log(colors.yellow.underline(text + "\n"));
}

function displayOptions(options) {
  const corners = ["┌", "┐", "└", "┘"];
  const maxLen = Math.max(
    ...options.map((element) => element.key.length + element.name.length + 2)
  );
  options.forEach((option) => {
    const caption = `${option.key}: ${option.name}`;

    console.log(colors.blue(corners[0] + "─".repeat(maxLen + 2) + corners[1]));
    console.log(
      colors.blue(
        "│ " +
          colors.white(caption) +
          " ".repeat(maxLen - caption.length) +
          colors.blue(" │")
      )
    );
    console.log(colors.blue(corners[2] + "─".repeat(maxLen + 2) + corners[3]));
  });
}

function showFileList() {
  return new Promise((resolve) => {
    fs.readdir(directoryPath, async (err, files) => {
      if (err) {
        return console.log(
          "Lo siento. No pude leer la lista de archivos: " + err
        );
      }

      // Mostrar una lista de archivos
      files.forEach((file) => {
        console.log(file);
      });
      resolve();
    });
  });
}

function displayFileContents(fileName) {
  const fileNameAndPath = directoryPath + "/" + fileName;
  return new Promise((resolve) => {
    fs.readFile(fileNameAndPath, "utf8", async (err, data) => {
      if (err) {
        console.log(colors.bgRed.white("No se puede leer ese archivo."));
      } else {
        console.log(
          colors.brightGreen(`\nContenido del archivo: ${fileName}\n`)
        );
        console.log(colors.white(data));
      }
      resolve();
    });
  });
}

function writeFile(fileNameAndPath, content) {
  return new Promise((resolve) => {
    fs.writeFile(fileNameAndPath, content, async (err) => {
      if (err) {
        console.log(
          colors.bgRed.white(
            "No se pudo escribir este archivo. Revise que el archivo exista y que tiene permisos para escribir en él"
          )
        );
      }
      resolve();
    });
  });
}

function checkFileExists(filename) {
  return new Promise((resolve) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function deleteFile(fileNameAndPath, content) {
  return new Promise((resolve) => {
    fs.rm(fileNameAndPath, async (err) => {
      if (err) {
        console.log(
          colors.bgRed.white(
            "No se pudo borrar este archivo. Revise que el archivo exista y que tiene permisos para borrarlo"
          )
        );
      }
      resolve();
    });
  });
}

async function main() {
  const options = [
    { key: "L", name: "Leer" },
    { key: "E", name: "Editar" },
    { key: "C", name: "Crear" },
    { key: "B", name: "Borrar" },
    { key: "Ctrl C", name: "Salir" },
  ];

  while (true) {
    console.clear();

    displayAppTitle();
    displayOptions(options);

    const key = await askQuestion("Elija una opción: ");

    switch (key.toUpperCase()) {
      case "L": //Leer un archivo
        console.clear();
        displayTitle("Lista de archivos para mostrar su contenido");

        //Mostrar la lista de archivos
        await showFileList().then(async () => {
          const fileName = (
            await askQuestion(
              colors.green(
                "\n\nEscriba el nombre de un archivo para ver su contenido: "
              )
            )
          ).trim();
          if (fileName == "") return;

          await displayFileContents(fileName).then(async () => {
            await askQuestion(
              colors.yellow("\n\nPresione Enter para continuar...")
            );
          });

          return;
        });
        break;

      case "E": //Editar un archivo
        console.clear();
        displayTitle("Lista de archivos para editar");

        //Mostrar la lista de archivos
        await showFileList().then(async () => {
          const fileName = (
            await askQuestion(
              colors.green("\n\nEscriba el nombre de un archivo para editar: ")
            )
          ).trim();
          if (fileName == "") return;
          const fileNameAndPath = directoryPath + "/" + fileName;

          await checkFileExists(fileNameAndPath).then(async (exists) => {
            if (exists) {
              const content = await askQuestion(
                colors.yellow(
                  "\n\nEscriba el nuevo contenido del archivo y presione Enter para guardar:\n"
                )
              );
              await writeFile(fileNameAndPath, content).then(async () => {
                console.log(
                  colors.green("\n\nArchivo guardado correctamente.")
                );

                await askQuestion(
                  colors.yellow("\n\nPresione Enter para continuar...")
                );
              });
            } else {
              console.log(colors.bgRed.white("Ese archivo no existe."));

              await askQuestion(
                colors.yellow("\n\nPresione Enter para continuar...")
              );
              return;
            }
          });

          return;
        });
        break;

      case "C": //Crear un archivo
        console.clear();
        displayTitle("Crear un archivo nuevo");

        const fileName = (
          await askQuestion(
            colors.green("\n\nEscriba el nombre de un archivo para crear: ")
          )
        ).trim();

        if (fileName == "") break;

        const fileNameAndPath = directoryPath + "/" + fileName;

        await checkFileExists(fileNameAndPath).then(async (exists) => {
          if (exists) {
            console.log(
              colors.bgRed.white("Ese archivo ya existe. Elija otro nombre.")
            );

            await askQuestion(
              colors.yellow("\n\nPresione Enter para continuar...")
            );
          } else {
            const content = await askQuestion(
              colors.yellow(
                "\n\nEscriba el nuevo contenido del archivo y presione Enter para guardar:\n"
              )
            );
            await writeFile(fileNameAndPath, content).then(async () => {
              console.log(colors.green("\n\nArchivo guardado correctamente."));

              await askQuestion(
                colors.yellow("\n\nPresione Enter para continuar...")
              );
            });
          }
        });
        break;

      case "B": //Borrar un archivo
        console.clear();
        displayTitle("Borrar un archivo");

        //Mostrar la lista de archivos
        await showFileList().then(async () => {
          const fileName = (
            await askQuestion(
              colors.green("\n\nEscriba el nombre de un archivo para borrar: ")
            )
          ).trim();
          if (fileName == "") return;
          const fileNameAndPath = directoryPath + "/" + fileName;

          await checkFileExists(fileNameAndPath).then(async (exists) => {
            if (!exists) {
              console.log(colors.bgRed.white("Ese archivo no existe."));

              await askQuestion(
                colors.yellow("\n\nPresione Enter para continuar...")
              );
              return;
            } else {
              const answer = await askQuestion(
                colors.yellow(
                  `\n\n¿Está seguro que desea borrar el archivo ${fileName}? Escriba Si para borrarlo.\n`
                )
              );
              if (answer.toUpperCase() == "SI") {
                await deleteFile(fileNameAndPath).then(async () => {
                  console.log(
                    colors.green("\n\nArchivo borrado correctamente.")
                  );

                  await askQuestion(
                    colors.yellow("\n\nPresione Enter para continuar...")
                  );
                });
              }
            }
          });

          return;
        });
      default:
        break;
    }
  }
}

main();
