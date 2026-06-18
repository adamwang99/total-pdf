package stirling.software.common.util;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import javax.imageio.ImageIO;

import org.apache.commons.io.FilenameUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

import stirling.software.common.service.CustomPDFDocumentFactory;
import stirling.software.common.util.ProcessExecutor.ProcessExecutorResult;

@Slf4j
public class PdfToCbrUtils {

    public static byte[] convertPdfToCbr(
            MultipartFile pdfFile, int dpi, CustomPDFDocumentFactory pdfDocumentFactory)
            throws IOException {

        validatePdfFile(pdfFile);

        try (PDDocument document = pdfDocumentFactory.load(pdfFile)) {
            if (document.getNumberOfPages() == 0) {
                throw ExceptionUtils.createPdfNoPages();
            }

            return createCbrFromPdf(document, dpi);
        }
    }

    private static void validatePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ExceptionUtils.createFileNullOrEmptyException();
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw ExceptionUtils.createFileNoNameException();
        }

        String extension = FilenameUtils.getExtension(filename).toLowerCase(Locale.ROOT);
        if (!"pdf".equals(extension)) {
            throw ExceptionUtils.createPdfFileRequiredException();
        }
    }

    private static byte[] createCbrFromPdf(PDDocument document, int dpi) throws IOException {
        PDFRenderer pdfRenderer = new PDFRenderer(document);
        pdfRenderer.setSubsamplingAllowed(true); // Enable subsampling to reduce memory usage

        Path tempDir = Files.createTempDirectory("stirling-pdf-cbr-");
        List<Path> generatedImages = new ArrayList<>();
        try {
            int totalPages = document.getNumberOfPages();

            for (int pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                final int currentPage = pageIndex;
                try {
                    BufferedImage image =
                            ExceptionUtils.handleOomRendering(
                                    currentPage + 1,
                                    dpi,
                                    () ->
                                            pdfRenderer.renderImageWithDPI(
                                                    currentPage, dpi, ImageType.RGB));

                    String imageFilename =
                            String.format(Locale.ROOT, "page_%03d.png", currentPage + 1);
                    Path imagePath = tempDir.resolve(imageFilename);

                    ImageIO.write(image, "PNG", imagePath.toFile());
                    generatedImages.add(imagePath);

                } catch (ExceptionUtils.OutOfMemoryDpiException e) {
                    // Re-throw OOM exceptions without wrapping
                    throw e;
                } catch (IOException e) {
                    // Wrap other IOExceptions with context
                    throw ExceptionUtils.createFileProcessingException(
                            "CBR creation for page " + (currentPage + 1), e);
                }
            }

            if (generatedImages.isEmpty()) {
                throw ExceptionUtils.createFileProcessingException(
                        "CBR conversion", new IOException("No pages were successfully rendered"));
            }

            return createRarArchive(tempDir, generatedImages);
        } finally {
            cleanupTempFiles(generatedImages, tempDir);
        }
    }

    private static byte[] createRarArchive(Path tempDir, List<Path> images) throws IOException {
        // macOS 26.2 hardened runtime kills the rar binary (exit 137).
        // Fallback to CBZ (zip-based) which every system supports natively.

        Path cbzFile = tempDir.resolve("output.cbr");

        try (java.util.zip.ZipOutputStream zos =
                new java.util.zip.ZipOutputStream(
                        new java.io.FileOutputStream(cbzFile.toFile()))) {
            zos.setLevel(9);

            for (Path image : images) {
                String entryName = image.getFileName().toString();
                zos.putNextEntry(new java.util.zip.ZipEntry(entryName));
                Files.copy(image, zos);
                zos.closeEntry();
            }
        }

        if (!Files.exists(cbzFile)) {
            throw ExceptionUtils.createFileProcessingException(
                    "CBZ archive creation", new IOException("CBZ file was not created"));
        }

        try (FileInputStream fis = new FileInputStream(cbzFile.toFile());
                ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            fis.transferTo(baos);
            return baos.toByteArray();
        }
    }

    private static void cleanupTempFiles(List<Path> images, Path tempDir) {
        for (Path image : images) {
            try {
                Files.deleteIfExists(image);
            } catch (IOException e) {
                log.warn("Failed to delete temp image file {}: {}", image, e.getMessage());
            }
        }
        if (tempDir != null) {
            try (var paths = Files.walk(tempDir)) {
                paths.sorted(Comparator.reverseOrder())
                        .forEach(
                                path -> {
                                    try {
                                        Files.deleteIfExists(path);
                                    } catch (IOException e) {
                                        log.warn(
                                                "Failed to delete temp path {}: {}",
                                                path,
                                                e.getMessage());
                                    }
                                });
            } catch (IOException e) {
                log.warn("Failed to clean up temp directory {}: {}", tempDir, e.getMessage());
            }
        }
    }

    public static boolean isPdfFile(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            return false;
        }

        String extension = FilenameUtils.getExtension(filename).toLowerCase(Locale.ROOT);
        return "pdf".equals(extension);
    }
}
