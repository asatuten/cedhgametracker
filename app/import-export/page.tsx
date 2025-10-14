import { CsvImportDialog } from "@/components/csv/csv-import-dialog";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { importDecks, importGames, importPlayers, exportDecks, exportGames, exportPlayers } from "./actions";

const playerTemplate = `displayName\nSelvala\nNajeela`;
const deckTemplate = `playerName,deckName,moxfieldUrl,archetype,colorIdentity,commanders,companion\nSelvala,Turbo Selvala,,Turbo,G,Selvala Heart of the Wilds,`;
const gameTemplate = `date,podSize,players,seats,decks,mulligans,winnerSeat,turnsToWin,winTags,eliminationOrder,turnEliminated,notes\n2024-04-01,4,Selvala|Najeela|Tymna|Kinnan,1|2|3|4,Turbo Selvala|Najeela|Blue Farm|Kinnan,0|1|2|0,1,5,Thassa's Oracle|Dockside,2|3|4,5|7|8,Great game!`;

const ImportExportPage = async () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Import & Export</h1>
        <p className="text-sm text-muted-foreground">Bootstrap your tracker from spreadsheets or share data with your team.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import data</CardTitle>
            <CardDescription>Paste CSV rows to create or update records.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CsvImportDialog label="Import players" template={playerTemplate} onImport={importPlayers} />
            <CsvImportDialog label="Import decks" template={deckTemplate} onImport={importDecks} />
            <CsvImportDialog label="Import games" template={gameTemplate} onImport={importGames} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export data</CardTitle>
            <CardDescription>Download CSV snapshots for backup or analysis.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CsvExportButton label="Export players" filename="players.csv" onExport={exportPlayers} />
            <CsvExportButton label="Export decks" filename="decks.csv" onExport={exportDecks} />
            <CsvExportButton label="Export games" filename="games.csv" onExport={exportGames} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExportPage;
