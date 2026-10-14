CREATE OR REPLACE FUNCTION update_shelter_geom() RETURNS TRIGGER AS \$\$ BEGIN NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326); RETURN NEW; END; \$\$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_shelter_geom ON shelters; CREATE TRIGGER trg_shelter_geom BEFORE INSERT OR UPDATE ON shelters FOR EACH ROW EXECUTE FUNCTION update_shelter_geom();
