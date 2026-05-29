package com.intellicore.model;

public class DocumentMetadata {
    private String title;
    private String author;
    private String creator;
    private String producer;
    private String creationDate;
    private String modificationDate;
    private int width;
    private int height;
    private String colorSpace;

    public DocumentMetadata() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCreator() { return creator; }
    public void setCreator(String creator) { this.creator = creator; }

    public String getProducer() { return producer; }
    public void setProducer(String producer) { this.producer = producer; }

    public String getCreationDate() { return creationDate; }
    public void setCreationDate(String creationDate) { this.creationDate = creationDate; }

    public String getModificationDate() { return modificationDate; }
    public void setModificationDate(String modificationDate) { this.modificationDate = modificationDate; }

    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public String getColorSpace() { return colorSpace; }
    public void setColorSpace(String colorSpace) { this.colorSpace = colorSpace; }
}
