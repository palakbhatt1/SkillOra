from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    summary = Column(Text, nullable=True)
    role = Column(String, nullable=True)
    tech_stack = Column(String, nullable=True)
    
    facts = relationship("Fact", back_populates="project")
    sources = relationship("Source", back_populates="project")

class Source(Base):
    __tablename__ = "sources"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    type = Column(String) # 'github', 'pdf', 'notes'
    content_hash = Column(String, index=True)
    url_or_name = Column(String)
    raw_text = Column(Text, nullable=True)
    
    project = relationship("Project", back_populates="sources")

class Fact(Base):
    __tablename__ = "facts"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    fact_type = Column(String) # 'tech', 'metric', 'role', 'outcome'
    claim = Column(String)
    source_span = Column(String)
    source_file = Column(String)
    status = Column(String, default="pending") # 'pending', 'verified', 'stale'
    
    project = relationship("Project", back_populates="facts")
