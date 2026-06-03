from app.services.profession_profiles import resolve_profession_profile


def test_profession_profile_falls_back_to_universal() -> None:
    name, prompt = resolve_profession_profile("Unknown Role")

    assert name == "Universal"
    assert "universal meeting" in prompt


def test_doctor_profile_uses_soap_prompt() -> None:
    name, prompt = resolve_profession_profile("Doctor")

    assert name == "Doctor"
    assert "SOAP" in prompt


def test_software_engineer_profile_uses_technical_sections() -> None:
    name, prompt = resolve_profession_profile("Software Engineer")

    assert name == "Software Engineer"
    assert "Technical Blockers" in prompt


def test_journalist_profile_uses_editorial_sections() -> None:
    name, prompt = resolve_profession_profile("Journalist")

    assert name == "Journalist"
    assert "Key Revelations" in prompt
