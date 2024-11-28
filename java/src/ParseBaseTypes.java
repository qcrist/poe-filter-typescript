import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.lang3.tuple.Pair;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ParseBaseTypes {
    public static void main(String[] args) throws IOException {
        Path source = Path.of("ext/filterblade-public-assets/BaseTypes.csv");
//        Map<String, Map<String, Integer>> map = new HashMap<>();
        Map<String, List<Pair<Integer, String>>> map = new HashMap<>();
        CSVFormat format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build();
        String DISABLED = "disa";
        try (CSVParser parser = CSVParser.parse(source, StandardCharsets.UTF_8, format)) {
            List<CSVRecord> records = parser.getRecords();
            System.out.println("parser.getHeaderNames() = " + parser.getHeaderNames());
            for (CSVRecord row : records) {
                if (row.getRecordNumber() == 1) continue;
                String row_class = row.get("Class");
                String row_type = row.get("BaseType");
                String row_level = row.get("DropLevel");
                String sgA = row.get("SubGroup A");
                String sgB = row.get("SubGroup A");
                if (sgA.equals(DISABLED) || sgB.equals(DISABLED)) continue;
                int dropLevel = Integer.parseInt(row_level);
                map.computeIfAbsent(row_class, k -> new ArrayList<>())
                        .add(Pair.of(dropLevel, row_type));
            }
        }
        Map<String, List<String>> types = map.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, e -> {
            return e.getValue().stream().sorted().map(Pair::getRight).toList();
        }));
        String json = new JSONObject(types).toString(1);
        Files.writeString(Path.of("ext/filterblade-public-assets/base_types.json"), json);
    }
}
