import path from "path";
import sketch from "sketch";
import dialog from "@skpm/dialog";

export default function() {
  const { selectedPage } = sketch.getSelectedDocument();

  let currentX = 0;
  let i = 0;
  let width = 100;
  let height = 100;

  dialog.showOpenDialog(
    {
      title: "Import SVG as Artboards",
      buttonLabel: "Import",
      filters: [{ name: "Svg", extensions: ["svg"] }],
      properties: ["openFile", "multiSelections"]
    },
    filepaths =>
      filepaths.forEach((filepath, i) => {
        const name = path.basename(filepath, ".svg");

        const importer = MSSVGImporter.svgImporter();
        if (importer.prepareToImportFromURL) {
          importer.prepareToImportFromURL(NSURL.fileURLWithPath(filepath));
        } else {
          importer.prepareToImportFromURL_error(NSURL.fileURLWithPath(filepath), null);
        }

        if (i === 0) {
          sketch.UI.getInputFromUser(
            "Desired artboard width?", {
              initialValue: ''
            },
            (err, value) => {
              if (err) {
                return
              } else {
                width = value
              }
            }
          )
        
          sketch.UI.getInputFromUser(
            "Desired artboard height?", {
              initialValue: ''
            },
            (err, value) => {
              if (err) {
                return
              } else {
                height = value
              }
            }
          )
        }

        const frame = NSMakeRect(currentX, 0, width, height);
        const root = MSArtboardGroup.alloc().initWithFrame(frame);
        root.name = name;
        importer.graph().makeLayerWithParentLayer_progress(root, null);
        root.ungroupSingleChildDescendentGroups();
        importer.scale_rootGroup(importer.importer().scaleValue(), root);

        selectedPage.layers.unshift(root);

        currentX += parseInt(width) + 20;
        i += 1;
      })
  );
}
